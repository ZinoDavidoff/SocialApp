export interface User {
    uid?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    bio?: string;
    role?: string;
}

export interface Post {
    id?: string;
    author: string;
    imgUrl: string;
    category: string;
    description: string;
    createdOn: Date;
    likes: {displayName: string}[];
    comments: Comment[]; 
    isEdited: boolean;
    toggleButtonLike?: boolean;
}

export interface Comment {
    displayName: string;
    photoUrl: string;
    desc: string;
    createdOn: Date;
}

