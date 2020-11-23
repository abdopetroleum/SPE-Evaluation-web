const email = document.querySelector('#email');
const password = document.querySelector('#password');
const comuty = document.querySelector('#commuty');
const btnsbmt = document.querySelector('#sbmt');
const err = document.querySelector('#err');
const auth = firebase.auth();
const database = firebase.database().ref('membersData');

btnsbmt.addEventListener('click', () => {
    auth.signInWithEmailAndPassword(email.value, password.value)
        .then(cred => {
            database.child(`/${comuty.value}/members/adminUid`).once('value').then(
                (snapshot) => {
                    if (snapshot.val() === cred.user.uid){
                        window.location.href = "./dashboard.html";
                        cred.user.displayName=comuty.value
                    }
                    else
                        err.innerHTML = "Dear envoy, you are not authorized to that commuty"
                }
            )
            .catch(eror=>{ if (eror) err.innerHTML="Dear envoy, you have permission only to access your commuty"})


        })
        .catch(eror=>{ if (eror)err.innerHTML="Bad credential"});
    ;


});