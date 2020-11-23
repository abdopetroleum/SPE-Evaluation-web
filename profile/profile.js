const database = firebase.database();
const auth = firebase.auth();
let memberRef = database.ref(`membersData/${localStorage.getItem('comutee')}`);
const membersImagesRef = firebase.storage().ref().child('membersImages/' + localStorage.getItem('comutee'));
const month = document.querySelector('#month');
const sbmt = document.querySelector('#searchsbmt');
const dropdownTogller = document.querySelectorAll('.dropdownTogller');
const tasksToggler = document.querySelector('#tasksToggler');
const notesToggler = document.querySelector('#notesToggler');
let uid;
firebase.auth().onAuthStateChanged(async function  (user) {
    console.log(user);
    if (user) {
        await membersImagesRef.child(user.uid + '.jpg').getDownloadURL().then(url => document.querySelector('#profileImage').src=url).catch(err => console.log(err));
        memberRef = memberRef.child('/members').child(user.uid);
        document.querySelector('#commutee').innerHTML = localStorage.getItem('comutee');
        document.querySelector('body').classList.remove('hidden');
    }
    else {
        window.location.href = "./login.html";
    }
});
const renderProfile = (user) => {
    let totalDegrees = 0;
    let userDegree = 0;
    const tasks = Object.keys(user.tasks).filter(task => !user.tasks[task].type.toLowerCase().includes('note')).map(key => user.tasks[key]);
    console.log(tasks.length);
    if (tasks.length == 0)
        alert('there is no such tasks in that month');
    else {
        totalDegrees = tasks.length * 10;
        console.log(tasks);
        tasks.forEach(task => {
            userDegree += parseInt(task.value);
            if (task.name.toLowerCase() == "hrd")
                totalDegrees += 20;
        }
        );
        const percentage = (userDegree / totalDegrees) * 100;
        const profileSection = document.querySelector('#userinfo');
        profileSection.innerHTML = `
        <strong>${user.name} :</strong><span>${userDegree}/${totalDegrees}</span>

    `

    }
}
dropdownTogller.forEach(d => d.addEventListener('click', e => {
    if(d.classList.contains('openedArrow')){
        d.classList.remove('openedArrow');
        d.classList.add('closedArrow')
    }
    else{
        d.classList.remove('closedArrow');
        d.classList.add('openedArrow');
    }
    const section = d.parentElement;
    console.log(section);
    toggleSection(section);
}))
const toggleSection = (element) => {
    if (element.classList.contains('opened')) {
        element.classList.remove('opened');
        element.classList.add('closed');
        return;
    }
    else {
        element.classList.remove('closed');
        element.classList.add('opened');
    }
}
sbmt.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(memberRef);
    console.log(auth.currentUser);
    document.querySelectorAll('.content').forEach(content => content.innerHTML = "");
    memberRef.once('value').then((snapshot) => {
        if (snapshot.val() === null)
            alert('heads deosnt have tasks');
        else
            if (snapshot.val().tasks) {

                insertTasks(Object.keys(snapshot.val().tasks).map(key => {
                    return {
                        id: key,
                        task: snapshot.val().tasks[key]
                    }
                }));
                renderProfile(snapshot.val());

            }

    })
})
const insertTasks = (tasks) => {
    const filteredTasks = tasks.filter(task => task.task.month === month.value);
    if (filteredTasks.length < 1)
        alert('this month doesnt have tasks');
    else
        filteredTasks.forEach(task => {
            if (task.task.type.toLowerCase().includes('note')) {
                insertNote(task.task, task.task.type.toLowerCase());
                console.log('node');
            }
            else {
                insertTask(task.task, task.task.type.toLowerCase());
                console.log('not note');
                console.log(task.task.type);
            }
        })
}
const insertTask = (task, section) => {
    const content = document.querySelector(`#${section} .content`);
    const htmlRender = `
            <h6> ${task.name} <small>: ${task.value}</small> </h6>
      `
    content.innerHTML += htmlRender;

}
const insertNote = (note, section) => {
    const content = document.querySelector(`#${section} .content`);
    const htmlRender = `
            <h5> ${note.name}  </h5>
            <p class="bg-light border">${note.value}</p>
      `
    content.innerHTML += htmlRender;
}
notesToggler.addEventListener('click', () => {
    if (notesToggler.classList.contains('text-muted')) {
        document.querySelector('#task').classList.add('hidden');
        document.querySelector('#meeting').classList.add('hidden');
        document.querySelector('#positive_note').classList.remove('hidden');
        document.querySelector('#negative_note').classList.remove('hidden');
        notesToggler.classList.add('Active');
        notesToggler.classList.remove('text-muted');
        tasksToggler.classList.add('text-muted');
        tasksToggler.classList.remove('Active');
    }
})
tasksToggler.addEventListener('click', () => {
    if (tasksToggler.classList.contains('text-muted')) {
        document.querySelector('#task').classList.remove('hidden');
        document.querySelector('#meeting').classList.remove('hidden');
        document.querySelector('#positive_note').classList.add('hidden');
        document.querySelector('#negative_note').classList.add('hidden');
        tasksToggler.classList.add('Active');
        tasksToggler.classList.remove('text-muted');
        notesToggler.classList.add('text-muted');
        notesToggler.classList.remove('Active');
    }
})