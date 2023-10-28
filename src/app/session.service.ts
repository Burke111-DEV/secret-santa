import { Injectable } from '@angular/core';
import { IGroup, IUser, IWishlist, IWishlistTemplate } from './interfaces';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private authUser: any;
  private user!: IUser;
  private groups: Array<IGroup> = [];

  constructor() {}

  public setAuthUser(user: any) { this.authUser = user; }
  public getAuthUser(): any { return this.authUser; }

  public setUser(user: IUser) { this.user = user; }
  public getUser(): IUser { return this.user; }

  public setGroups(groups: Array<IGroup>) { this.groups = groups; }
  public getGroups(): Array<IGroup> { return this.groups; }
  public addLocalGroup(group: IGroup) { this.groups.push(group); }
  public deleteLocalGroup(groupName: string): void {
    const index = this.groups.findIndex(group => group.name === groupName);
    if (index !== -1) {
      this.groups.splice(index, 1);
      console.log(`Group ${groupName} deleted locally.`);
    } else {
      console.log(`Group ${groupName} not found in the local groups.`);
    }
  }

  public getWishlists(): Array<IWishlist> { return this.user.wishlists; }

  // User Accessors
  public getUserWishlists() { return JSON.parse(JSON.stringify(this.user.wishlists)); }
  public getUserWishlistTemplates() { return JSON.parse(JSON.stringify(this.user.wishlistTemplates)); }
  

  // User Mutators
  public deleteWishlistFromUser(name: string) {
    if (!this.user || !this.user.wishlists || this.user.wishlists.length === 0) 
      return;

    // Filter out wishlists with the given name
    const filteredWishlists: Array<IWishlist> = this.user.wishlists.filter(
      (wishlist: IWishlist) => wishlist.name !== name
    );

    // Create a new this.user object with filtered wishlists
    const updateduser: IUser = {
      ...this.user,
      wishlists: filteredWishlists,
    };
    this.user = updateduser;
  }
  public addWishlistToUser(wishlist: IWishlist) {
    const existingIndex = this.user.wishlists.findIndex(w => w.name === wishlist.name);

    if (existingIndex !== -1) 
      this.user.wishlists[existingIndex] = wishlist;
    else 
      this.user.wishlists.push(wishlist);
  }
  public addUserWishlistTemplate(wishlistTemplate: IWishlistTemplate) {
    if(wishlistTemplate.name == undefined || wishlistTemplate.name === "")
      return;

    const existingIndex = this.user.wishlistTemplates.findIndex( template => template.name === wishlistTemplate.name );

    if(existingIndex !== -1)
    this.user.wishlistTemplates[existingIndex] = wishlistTemplate;
    else
      this.user.wishlistTemplates.push(wishlistTemplate);
  }
}
