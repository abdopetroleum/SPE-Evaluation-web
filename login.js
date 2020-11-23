sessionStorage.removeItem('isLogging');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const comutee = document.querySelector('#comutee');
const sbmt = document.querySelector('#sbmt');
const auth = firebase.auth();
const database = firebase.database();
const membersData = database.ref('membersData');
auth.onAuthStateChanged(function (user) {
    if(user){
    console.log(localStorage.getItem('comutee'));
    if(!window.sessionStorage.getItem('isLogging')){
        console.log('not logging');
        window.location.href='./profile.html';
    }
}
else
    document.querySelector('body').classList.remove('hidden');
  
}); sbmt.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('sd');
    if (validate()) {
        console.log('validate')
        window.sessionStorage.setItem('isLogging',true);
        auth.signInWithEmailAndPassword(email.value, password.value)
            .then(async (res) => {
                if (await isCommuteeContainsUser(res.user.uid)) {
                    console.log('dasdas');
                    localStorage.setItem('comutee', comutee.value);
                    window.location.href="./profile.html";
                }
                else {
                    Authentication.setErrMessage('comutee', 'This email does not belongs to that committee');
                }
            }
            )
            .catch(e =>{
                sessionStorage.removeItem('isLogging');
                 Authentication.setErrMessage('email', 'bad credential')
            }
                 )
            ;
    }
});

const validate = () => {
    Authentication.setErrMessage('comutee', '');
    Authentication.valid = true;
    Authentication.validateEmail(email.value)
    return (Authentication.valid);
}
const isCommuteeContainsUser = async (uid) => {

    let isUserExists = true;
    await membersData.child(comutee.value).child('members').child(uid).once('value', (snapshot) => {
        console.log(snapshot.val());
        console.log(uid);

    }).catch(e => {
        isUserExists = false;
    })
    return isUserExists;

}
