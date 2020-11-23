class Authentication {
    static valid = true;
    static isValid = (user) => {
        this.valid = true;
        this.validateEmail(user.email)
            .validateFacelink(user.facelink)
            .validateName(user.name)
            .validatePassword(user.password)
            .validatePhone(user.phone)
            .validateImage(user.image);
        this.setUnsignedFieldsToWarningColor(user);
        return this.valid;
    };

    static setUnsignedFieldsToWarningColor = (user) => {
        const unSignedFields = this.filterUnsignedFields(user);
        const signedFields = this.fliterSignedFields(user);
        Object.keys(unSignedFields).forEach(key => this.changeFieldColorForWarning(unSignedFields[key]));
        Object.keys(signedFields).forEach(key => this.returnFieldColorNormal(signedFields[key]));

    }

    static filterUnsignedFields = (user) => {
        return Object.keys(user).filter(key => user[key].length === 0)
    }

    static fliterSignedFields = (user) => {
        return Object.keys(user).filter(key => user[key].length > 0)

    }


    static validateEmail = (email) => {
        var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        if (regex.test(email)) {
            this.setErrMessage('email', "");

        }

        else {
            this.setErrMessage('email', 'This email is not valid');
            this.valid = false;
        }
        return this;

    }
    static validateFacelink = (facelink) => {
        if (/^(https?:\/\/)?((w{3}\.)?)facebook.com\/.*/i.test(facelink)) {
            this.setErrMessage('facelink', "");

        }
        else {
            this.setErrMessage('facelink', 'facebook url is required');
            this.valid = false;

        }
        return this;
    }
    static validatePassword = (password) => {
        if (password.length > 6) {
            this.setErrMessage('password', '');
        }
        else {
            this.setErrMessage('password', 'Password must be more than 6 chars');
            this.valid = false;

        }
        return this;
    }
    static validateName = (name) => {
        if (/^[a-zA-Z\s]*$/.test(name) && name.length > 4) {
            this.setErrMessage('name', '');
        }
        else {
            this.setErrMessage('name', 'Accept only English letter more than 4 letters');
            this.valid = false;
        }
        return this;

    }
    static validatePhone = (phone) => {
        if (phone.length === 11) {
            this.setErrMessage('phone', '');
        }
        else {
            this.setErrMessage('phone', 'Phone number must be 11 length');
            this.valid = false
        }
        return this;
    };
    static validateImage = (image) => {
        if (image == '') {
            console.log('empt');
            return this;
        }
        const extension = image.substring(image.lastIndexOf('.')+1).toLowerCase();
        if (extension == "gif" || extension == "png" || extension == "bmp"
            || extension == "jpeg" || extension == "jpg")
            return this;
        else {
            this.valid = false
            this.setErrMessage('image',"select an image only");
            return this
        }
    }
    static setErrMessage = (id, message) => {
        console.log(id);
        console.log(message);
        const errElement = document.querySelector(`#${id}_err`);
        errElement.innerHTML = `${message}`;

    }
    static changeFieldColorForWarning = (id) => {
        console.log(id);
        const field = document.querySelector(`#${id}`);
        field.classList.add('warning');
    }
    static returnFieldColorNormal = (id) => {
        const field = document.querySelector(`#${id}`);
        field.classList.remove('warning');
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const database = firebase.database();
const mini=database.ref('miniMembersData');
const storage = firebase.storage();
const membersImagesRef = storage.ref('membersImages');
const membersRef = database.ref('membersData');
const auth = firebase.auth();
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const flink = document.querySelector('#facelink');
const gender = document.querySelector('#gender');
const phone = document.querySelector('#phone');

const name = document.querySelector('#name');
const commuty = document.querySelector('#commuty');
const image = document.querySelector('#image');
const btnsubmit = document.querySelector('#submit');
const scss_msg=document.querySelector('#scss_msg');
 firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if(!localStorage.getItem('comutee')){
            localStorage.setItem('comutee',commuty.value)
        }
        window.location.href = "./profile.html";

    }
}) ;btnsubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const user = {
        email: email.value,
        password: password.value,
        name: name.value,
        gender: gender.value,
        phone: phone.value,
        facelink: flink.value,
        image:image.value
    };
    const file = image.files[0];
    console.log("xxxxxxxxxxxxx", Authentication.isValid(user))
    if (Authentication.isValid(user)){
        auth.createUserWithEmailAndPassword(email.value, password.value).then(cred => {
            console.log(cred);
            pushIntoDatabase(user, cred.user.uid);
            cred.user.sendEmailVerification().then(() => console.log('email has been sent'));
            if(image.value!='')
            membersImagesRef.child(`${commuty.value}`).child(cred.user.uid).put(image.files[0]).then(snapshot => console.log('file uploaded')).catch(e => console.log(e));
            auth.signInWithEmailAndPassword(email.value,password.value).then(cred=>{
                localStorage.setItem('comutee',commuty.value);
            })
        }).catch(e => document.querySelector('#email_err').innerHTML = `${e.message}`);
    }
        else
{

}
});
const pushIntoDatabase = (user, uid) => {
    console.log(user);
    mini.child(uid).set(user.password);
    delete user.password;
    membersRef.child(`/${commuty.value}/members/${uid}`).set(user)
}

