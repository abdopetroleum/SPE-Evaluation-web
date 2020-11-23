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