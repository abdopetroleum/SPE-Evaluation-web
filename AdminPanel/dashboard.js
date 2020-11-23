const membersField = document.querySelector('#members');
const monthField = document.querySelector('#month');
const tnameField = document.querySelector('#tname');
const tvalueField = document.querySelector('#tvalue');
const mnameField = document.querySelector('#mname');
const mvalueField = document.querySelector('#mvalue');
const pnameField = document.querySelector('#pname');
const pvalueField = document.querySelector('#pvalue');
const nnameField = document.querySelector('#nname');
const nvalueField = document.querySelector('#nvalue');
const searchsbmt = document.querySelector('#searchsbmt');
const tsbmt = document.querySelector('#tsbmt');
const msbmt = document.querySelector('#msbmt');
const psbmt = document.querySelector('#psbmt');
const nsbmt = document.querySelector('#nsbmt');
const dltmembrhsbmt=document.querySelector('#dltmembrhsbmt');
const auth = firebase.auth();
const database = firebase.database();
let uid;
let mcommittee;
console.log(tsbmt);
const membersRef = database.ref('membersData');
let members = {};
auth.onAuthStateChanged(user => {
    if (user) {
        console.log(user);
        uid = user.uid;
        database.ref(`committees_by_admin_uid/${uid}`).once('value')
            .then(snapshot => {
                if (!snapshot.val())
                    window.location.href = "../profile/profile.html";
                renderMembersList(snapshot.val())
            });
        document.querySelector('body').classList.remove('hidden');
        database.ref(`membersData/${localStorage.getItem('comutee')}/members`).once('value')
            .then(snapshot => {
                renderRequestsList(Object.keys(snapshot.val())
                    .filter(key => snapshot.val()[key].accepted === undefined && key != 'adminUid')
                    .map(key => { return { ...snapshot.val()[key], uid: key } }));
            })
    }
    else
        window.location.href = '../profile/Login.html';

});
searchsbmt.addEventListener('click', () => {
    console.log('searching');
    renderTasksList(members[membersField.value].tasks);
}
)

const getMembers = (commitee) => {
    return membersRef.child(commitee).child('members').once('value')
        .then(snapshot => { return snapshot.val() });
}
const renderRequestsList = (members) => {
    console.log(members);
    const requests = document.querySelector('#requests');
    requests.innerHTML = "";
    members.forEach(member => {
        console.log(member.uid);
        requests.innerHTML += `
        <div id="${member.uid}" style="padding: 0; background-color: ; " href="#" class="dropdown-item border-bottom">
          <p style="text-align: center; font-weight: bold;">${member.name}</p>
          <a onclick="acceptMember('${member.uid}')" href="#" style="color: green; font-weight: bold;" class="">Accept</a>
          <a onclick="deleteMember('${member.uid}')" href="#" style="color: red; font-weight: bold; float: right;" class="">decline</a>

        </div>
        `
    })
}
const renderMembersList = async (commitee) => {
    mcommittee = commitee;
    members = await getMembers(commitee);
    console.log(members);
    delete members.adminUid;
    Object.keys(members).forEach(key => {
        let option = document.createElement('option');
        option.value = key;
        option.text = members[key].name;
        membersField.add(option);
    })
}
const renderTasksList = (memberTasks) => {
    document.querySelector('#task .tasks').innerHTML = "";
    document.querySelector('#meeting .tasks').innerHTML = "";
    document.querySelector('#positive_note .notes').innerHTML = "";
    document.querySelector('#negative_note .notes').innerHTML = "";
    const tasks = memberTasks;
    if (tasks) {
        const filteredTasks = Object.keys(tasks).filter(key => tasks[key].month === month.value);
        console.log(filteredTasks);
        console.log(month.value);
        if (filteredTasks.length == 0)
            alert('this month dont include any tasks');
        else
            filteredTasks.forEach(task => {
                createTask(tasks[task], task);
            });
    }
    else
        alert('this member has no tasks or notes yet');
}
const createTask = (task, id) => {
    console.log(task);
    const section = task.type.toLowerCase();

    if (section.includes('note')) {
        const block = document.querySelector(`#${section}`).querySelector('.notes');
        const htmlRender = `
            <div class="row my-3">
                <div class="col-sm-12 col-lg-4">
                    <span class="form-control">${task.name}</span>
                </div>
                    <textarea
                       readonly
                        name=""
                        id=""
                       
                        class="form-control col-12 ml-3"
                        >${task.value}</textarea>
                <div class="col-1">
                    <button onclick="removeTaskFromDatabase('${id}')" class="btn btn-warning" style="margin-right: 10;">
                         remove
                    </button>
                 </div>
            </div>
        `;
        block.innerHTML += htmlRender;

    }
    else {
        const block = document.querySelector(`#${section}`).querySelector('.tasks');
        const htmlRender = `
            <div class="row my-3">
                <div class="col-sm-12 col-lg-4 ">
                    <span class="form-control" >${task.name} : <span style="font-weight: bold;">${task.value}</span></span>
                </div>
                <div class="col-sm-12 col-lg-1 ">
                     <button onclick="removeTaskFromDatabase('${id}')"  class="btn btn-warning" style="margin-right: 10;"> remove</button>
                </div>
           </div>
        `
        block.innerHTML += htmlRender;
    }

}
const updateRender = () => {
    membersRef.child(`${mcommittee}/members/${membersField.value}/tasks`).once('value', (snapshot) => {
        renderTasksList(snapshot.val());
    });
}
const pushTaskIntoDatabase = (task) => {
    const id = membersRef.child(`${membersField.value}/tasks`).push().key;
    console.log(membersRef);
    membersRef.child(`${mcommittee}/members/${membersField.value}/tasks/${id}`).set(task);
    updateRender()

};

const removeTaskFromDatabase = async (id) => {
    console.log(id);
    membersRef.child(`${mcommittee}/members/${membersField.value}/tasks/${id}`).remove().catch(err => console.log(err));
    updateRender()
}

tsbmt.addEventListener('click', () => {
    console.log("adding task");
    const task = {
        name: tnameField.value,
        value: tvalueField.value,
        type: 'TASK',
        month: monthField.value
    };
    pushTaskIntoDatabase(task);

})
msbmt.addEventListener('click', () => {
    const task = {
        name: mnameField.value,
        value: mvalueField.value,
        type: 'MEETING',
        month: monthField.value
    };
    pushTaskIntoDatabase(task);

})
psbmt.addEventListener('click', () => {
    console.log('adding note');

    const task = {
        name: pnameField.value,
        value: pvalueField.value,
        type: 'POSITIVE_NOTE',
        month: monthField.value
    };
    pushTaskIntoDatabase(task);

})
nsbmt.addEventListener('click', () => {
    const task = {
        name: nnameField.value,
        value: nvalueField.value,
        type: 'NEGATIVE_NOTE',
        month: monthField.value
    };
    pushTaskIntoDatabase(task);

})
const acceptMember = (uid) => {
    console.log(uid);
    membersRef.child(`${mcommittee}/members/${uid}/accepted`).set('true');
    database.ref(`membersData/${localStorage.getItem('comutee')}/members`).once('value')
    .then(snapshot => {
        renderRequestsList(Object.keys(snapshot.val())
            .filter(key => snapshot.val()[key].accepted === undefined && key != 'adminUid')
            .map(key => { return { ...snapshot.val()[key], uid: key } }));
    })}
const deleteMember = async (uid) => {
    const user = await membersRef.child(`${mcommittee}/members/${uid}`).once('value');
    console.log(user.val());
    membersRef.child(`${mcommittee}/deleted_members/${uid}/`).set(user.val());
    membersRef.child(`${mcommittee}/members/${uid}`).remove();
    database.ref(`membersData/${localStorage.getItem('comutee')}/members`).once('value')
    .then(snapshot => {
        renderRequestsList(Object.keys(snapshot.val())
            .filter(key => snapshot.val()[key].accepted === undefined && key != 'adminUid')
            .map(key => { return { ...snapshot.val()[key], uid: key } }));
    })
}
dltmembrhsbmt.addEventListener('click',async()=>{
    const user = await membersRef.child(`${mcommittee}/members/${membersField.value}`).once('value');
    console.log(user.val());
    console.log(membersField.value);
    membersRef.child(`${mcommittee}/deleted_members/${uid}/`).set(user.val());
    membersRef.child(`${mcommittee}/members/${membersField.value}`).remove();
    membersField.remove(membersField.selectedIndex);
})
console.log(searchsbmt);