auth.onAuthStateChanged(function (user) {
    if(user){
        const comutee=localStorage.getItem('comutee');
        let memberRef = database.ref(`membersData/${localStorage.getItem('comutee')}/members/adminUid`);
        memberRef.once('value',(snapshot)=>{
            if(user.uid==snapshot.val()){
                document.querySelector('#adminpanel').classList.remove('hidden');
            }
        
        })
    }
});