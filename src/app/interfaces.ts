export interface IUser {
    name: string,
    id: string,
    wishlists: Array<IWishlist>,
    groups: Array<string>,
    wishlistTemplates: Array<IWishlistTemplate>
}

export interface IWishlist {
    name: string, 
    [key: string]: string
}

export interface IWishlistTemplate {
    name: string, 
    questions: Array<string>
}

export function generateTemplateFromWishlist(wishlist: IWishlist) {
    console.log("generating template from data", wishlist);

    // Extract question keys from the wishlist object
    const questionKeys = Object.keys(wishlist).filter(key => key !== 'name');
    console.log(questionKeys);

    // Create an array of question strings based on the keys
    const questions: Array<string> = questionKeys.map(key => wishlist[key]);

    // Generate the template object
    const template: IWishlistTemplate = {
        name: wishlist.name,
        questions: questionKeys
    };

    return template;
}

export function mergeTemplates(wishlistTemplateA: IWishlistTemplate, wishlistTemplateB: IWishlistTemplate) {
    // Combine questions from both templates into a single array
    const combinedQuestions: string[] = [...wishlistTemplateA.questions, ...wishlistTemplateB.questions];

    // Remove duplicates from the combined array
    const uniqueQuestions: string[] = Array.from(new Set(combinedQuestions));

    // Create the merged template object
    const mergedTemplate: IWishlistTemplate = {
        name: wishlistTemplateA.name,
        questions: uniqueQuestions
    };

    return mergedTemplate;
}

const joinCodeMax = 34**4;
export function generateNewJoinCode() {
    const newJoinCodeNumber = (<number>Math.floor( Math.random() * joinCodeMax )).toString(34).toUpperCase();
    console.log(newJoinCodeNumber);
    return newJoinCodeNumber;
}
export interface IGroup {
    name: string;
    adminName: string;
    budget: number;
    participants: { [name: string]: string };       // Map of names to uids
    participantsReady: { [name: string]: boolean }; // Map of names to true/false
    noMatchPairs: { [name: string]: string };       // Map of names to names
    wishlistTemplate: IWishlistTemplate;            // Map of names to wishlist names
    wishlists: { [name: string]: string };          // Map of names to wishlist names
    isGenerated: boolean;
    santas: { [santaName: string]: string };        // Map of Santa Names to Recipient Names
    joinCode: string;
}

export interface IGroupEditableFields {
    participants?: { [name: string]: string };
    participantsReady?: { [name: string]: boolean };
    wishlistTemplate?: IWishlistTemplate;
    wishlists?: { [name: string]: string };
    isGenerated?: boolean;
    santas?: { [santaName: string]: string };
}

/*
Fix:
*/

/*
I think is ok:

- Text inputs
    - Retain text formatting
- View Wishlist
    - Preformatted text views

- Admin show joincode

- Delete Wishlist
    - Check if enterred in a group. If so, remove.

- Delete group
    -> Remove wishlist template from participants
*/