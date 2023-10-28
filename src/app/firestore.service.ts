import { Injectable } from '@angular/core';
import { getFirestore, collection, doc, addDoc, query, where, getDocs, QuerySnapshot, QueryDocumentSnapshot, setDoc, DocumentSnapshot, updateDoc, getDoc, runTransaction, deleteDoc } from 'firebase/firestore';
import { IGroup, IGroupEditableFields, IUser, IWishlist } from './interfaces';
import { SessionService } from './session.service';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private db: any;

  constructor(private session: SessionService) { this.getFirestore() }
  
  private async getFirestore() {
    try {
      this.db = getFirestore();
    } catch (error) {
      setTimeout(() => {
        this.getFirestore();
      }, 500);
    }
  }

  async checkUserExists(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return user != null;
  }

  public async checkIfJoinCodeExists(newJoinCode: string): Promise<boolean> {
    const groupsCollection = collection(this.db, 'groups');
    const q = query(groupsCollection, where('joinCode', '==', newJoinCode));

    try {
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking join code:', error);
        return false;
    }
  }

  public async getUser(uid: string) {
    const usersCollection = collection(this.db, 'users');
    const q = query(usersCollection, where('id', '==', uid));
    const querySnapshot: QuerySnapshot = await getDocs(q);

    if(querySnapshot.empty) return null;

    const users: IUser[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const user: IUser = {
        name: data['name'],
        id: data['id'],
        groups: data['groups'],
        wishlists: data['wishlists'],
        wishlistTemplates: data['wishlistTemplates']
      };
      users.push(user);
    });

    return users[0];
  }

  public async refreshUser() {
    const user = await this.getUser(this.session.getUser().id);
    if(user)
      this.session.setUser(<IUser> user);
  }

  public async createNewUser(userData: IUser) {
    if(userData == undefined || userData.name == undefined || userData.name == "") 
      return;
    
    const usersCollection = collection(this.db, 'users');
    await addDoc(usersCollection, userData);
  }

  public updateUserData(): void {
    const currentUser: IUser = this.session.getUser();
    if (!currentUser) 
      return;

    const usersCollectionRef = collection(this.db, 'users');
    const userRef = query(usersCollectionRef, where('id', '==', currentUser.id));

    getDocs(userRef)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setDoc(doc.ref, currentUser, { merge: true })
            .then(() => {
              console.log('User data updated successfully in Firestore!');
            })
            .catch((error) => {
              console.error('Error updating user data: ', error);
            });
        });
      })
      .catch((error) => {
        console.error('Error querying Firestore: ', error);
      });
  }

  public async createNewGroup(groupData: IGroup) {
    if(groupData == undefined || (groupData.name == undefined || groupData.name == "") || (groupData.adminName == undefined || groupData.adminName == "")) 
      return;
    
    const usersCollection = collection(this.db, 'groups');
    await addDoc(usersCollection, groupData);
  }

  public getGroupFromJoinCode(joinCode: string)  {
    return new Promise(async (resolve, reject) => {
      const groupsCollection = collection(this.db, 'groups');
      const q = query(groupsCollection, where('joinCode', '==', joinCode));

      try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const groupData = querySnapshot.docs[0].data();
            if (querySnapshot.docs.length > 0 && groupData)
              return resolve(<IGroup>groupData);
          }
          return resolve(null);
      } catch (error) {
          console.error('Error checking join code:', error);
          return reject("BAD");
      }
    })
  }

  public async getGroupsByParticipant(userName: string, userId: string): Promise<IGroup[]> {
    const groupsCollection = collection(this.db, 'groups');
    const q = query(groupsCollection, where(`participants.${userName}`, '==', userId));

    try {
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);
      const groups: IGroup[] = [];
      querySnapshot.forEach((doc) => {
        const groupData = doc.data() as IGroup;
        groups.push(groupData);
      });
      return groups;
    } catch (error) {
      console.error('Error querying groups by participant ID:', error);
      throw error; // Handle the error as needed
    }
  }

  public async getRecipientWishlist(userName: string, userId: string, wishlistName: string): Promise<IWishlist | null> {
    const usersCollection = collection(this.db, 'users');
    const q = query(usersCollection, where('name', '==', userName), where('id', '==', userId));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as IUser;

        // Find the wishlist with the specified name in the user's wishlists
        const recipientWishlist = userData.wishlists.find(wishlist => wishlist.name === wishlistName);

        if (recipientWishlist) {
          // Wishlist found, return it
          return recipientWishlist;
        } else {
          // Wishlist not found, handle accordingly (return null, throw an error, etc.)
          return null;
        }
      } else {
        // User not found, handle accordingly (return null, throw an error, etc.)
        return null;
      }
    } catch (error) {
      console.error('Error getting recipient wishlist:', error);
      throw error; // Handle the error as needed
    }
  }

  
  async updateParticipant(groupName: string, groupAdminName: string, participantName: string, userId: string): Promise<void> {
    const groupsCollectionRef = collection(this.db, 'groups');
    const q = query(groupsCollectionRef, 
        where('name', '==', groupName),
        where('adminName', '==', groupAdminName)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Assuming there's only one group matching the query (you might need to handle multiple results differently)
            const groupDoc = querySnapshot.docs[0];
            const groupId = groupDoc.id;

            await runTransaction(this.db, async (transaction) => {
                const groupDocRef = doc(this.db, 'groups', groupId);
                const groupDocSnapshot = await transaction.get(groupDocRef);
                if (groupDocSnapshot.exists()) {
                    const groupData: IGroup = groupDocSnapshot.data() as IGroup;
                    // Update the participants field with the new user id for the provided participant name
                    groupData.participants[participantName] = userId;
                    // Perform the update within the transaction
                    transaction.update(groupDocRef, {
                        participants: groupData.participants
                    });
                } else {
                    console.error('Group not found');
                }
            });
        } else {
            console.error('Group not found');
        }
    } catch (error) {
        console.error('Error updating participant:', error);
        throw error; // Throw the error for further handling if needed
    }
  }

  async updateGroupData(groupName: string, groupAdminName: string, fields: IGroupEditableFields, retryCount: number = 3): Promise<void> {
    const groupsCollectionRef = collection(this.db, 'groups');
    const q = query(groupsCollectionRef, 
        where('name', '==', groupName),
        where('adminName', '==', groupAdminName)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0];
        const groupId = groupDoc.id;

        await runTransaction(this.db, async (transaction) => {
          const groupDocRef = doc(this.db, 'groups', groupId);
          const groupDocSnapshot = await transaction.get(groupDocRef);
          if (groupDocSnapshot.exists()) {
            const groupData: IGroupEditableFields = groupDocSnapshot.data() as IGroupEditableFields;
            

            //// Manage ParticipantsReady
            // Retrieve existing participantsReady object or create a new one if it doesn't exist
            const participantsReady = groupData.participantsReady || {};
            // Update the specific key in participantsReady object
            if (fields.participantsReady) {
              Object.keys(fields.participantsReady).forEach((key) => {
                if(fields.participantsReady)
                  participantsReady[key] = fields.participantsReady[key];
              });
            }
            // Update the participantsReady field in the group data
            groupData.participantsReady = participantsReady;
            delete fields.participantsReady;


            //// Manage Wishlists
            // Retrieve existing wishlists object or create a new one if it doesn't exist
            const wishlists = groupData.wishlists || {};
            // Update the specific key in wishlists object
            if (fields.wishlists) {
              Object.keys(fields.wishlists).forEach((key) => {
                if(fields.wishlists)
                  wishlists[key] = fields.wishlists[key];
              });
            }
            // Update the wishlists field in the group data
            groupData.wishlists = wishlists;
            delete fields.wishlists;

            
            // Merge the provided fields with existing data
            const updatedFields = { ...groupData, ...fields };
            // Perform the update within the transaction
            transaction.update(groupDocRef, updatedFields);
          } else {
            console.error('Group not found');
          }
        });
      } else {
        console.error('Group not found');
      }
    } catch (error) {
      console.error('Error updating group data:', error);
      if (retryCount > 0) {
        // Retry after waiting for 1000ms
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.updateGroupData(groupName, groupAdminName, fields, retryCount - 1);
      } else {
        console.error('Exceeded maximum retry attempts. Failed to update group data.');
        throw error;
      }
    }
  }

  public async deleteGroup(groupName: string, adminName: string): Promise<void> {
    const groupsCollection = collection(this.db, 'groups');
    const q = query(groupsCollection, where('name', '==', groupName), where('adminName', '==', adminName));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0];
        const groupId = groupDoc.id;
        const groupDocRef = doc(this.db, 'groups', groupId);

        await deleteDoc(groupDocRef);
        console.log(`Group ${groupName} with admin ${adminName} deleted successfully.`);
      } else {
        console.log(`Group ${groupName} with admin ${adminName} not found.`);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error; // Handle the error as needed
    }
  }

  public async removeWishlistTemplateFromUser(userName: string, templateName: string): Promise<void> {
    const usersCollection = collection(this.db, 'users');
    const q = query(usersCollection, where('name', '==', userName));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userDocRef = doc(this.db, 'users', userId);

        const userData = userDoc.data() as IUser;
        const updatedTemplates = userData.wishlistTemplates.filter(template => template.name !== templateName);

        // Update the user's data with the filtered wishlist templates
        await updateDoc(userDocRef, {
          wishlistTemplates: updatedTemplates
        });

        console.log(`Wishlist template ${templateName} removed successfully from user ${userName}.`);
      } else {
        console.log(`User ${userName} not found.`);
      }
    } catch (error) {
      console.error('Error removing wishlist template:', error);
      throw error; // Handle the error as needed
    }
  }

  public async updateGroupWishlists(groupName: string, groupAdminName: string, newWishlists: { [name: string]: string }): Promise<void> {
    const groupsCollectionRef = collection(this.db, 'groups');
    const q = query(groupsCollectionRef, 
        where('name', '==', groupName),
        where('adminName', '==', groupAdminName)
    );
  
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0];
        const groupId = groupDoc.id;
  
        const groupDocRef = doc(this.db, 'groups', groupId);
        await updateDoc(groupDocRef, { wishlists: newWishlists });
      } else {
        console.error('Group not found');
      }
    } catch (error) {
      console.error('Error updating wishlists in group data:', error);
      throw error;
    }
  }  

  public async clearWishlistFromGroups(wishlistName: string) {
    const user = this.session.getUser();
    const groups = await this.getGroupsByParticipant(user.name, user.id);

    function findKeyByValue(obj: { [key: string]: any }, value: any): string | null {
      const foundKey = Object.keys(obj).find(key => obj[key] === value);
      return foundKey || null;
    }

    groups.forEach(group => {
      try {
        const ptcptName = <string>findKeyByValue(group.participants, user.id);
        const groupWishlistName = group.wishlists[ptcptName];
        if(groupWishlistName && groupWishlistName == wishlistName) {
          const newWishlists = JSON.parse(JSON.stringify(group.wishlists));
          delete newWishlists[ptcptName]
          this.updateGroupWishlists(group.name, group.adminName, newWishlists);
          console.log(ptcptName, groupWishlistName, group.wishlists, newWishlists);
          group.wishlists = newWishlists;
        }
      } catch (error) {
        console.log("Groups Loop", error);
      }
      console.log(this.session.getGroups());
    });
    
    this.session.setGroups(groups);
  }

  public async refreshGroups() {
    const user = this.session.getUser();
    this.session.setGroups(await this.getGroupsByParticipant(user.name, user.id));
  }
}