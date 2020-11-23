const sbmt = document.querySelector('#searchsbmt');
const month = document.querySelector('#month');
const database = firebase.database();
const auth = firebase.auth();
const membersImagesRef = firebase.storage().ref().child('membersImages/' + localStorage.getItem('comutee'));

let memberRef = database.ref(`membersData/${localStorage.getItem('comutee')}/members`);
let image = [];
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        window.location.href = "./login.html";
    }

    document.querySelector('body').classList.remove('hidden');


});
sbmt.addEventListener('click', () => {
    console.log('search');
    memberRef.once('value', (snapshot) => {
        console.log(snapshot.val());
        let sorted_users = sortRanks(Object.keys(snapshot.val()).filter(key => snapshot.val()[key].tasks != undefined).map(key => {
            let user = snapshot.val()[key];
            user.uid = key;
            return user;
        }));
        console.log(sorted_users);
        renderLeaderBoard(sorted_users.filter(user => user.degree.absoluteTotalDegree != 0));
    })
})
const renderLeaderBoard = (users) => {
    document.querySelector('#leaderboard').innerHTML =
        `<li class="list-item">
    <ul class="list-group list-group-horizontal  list-group-flush">
        <li class="list-group-item font-weight-bold" style="width:87px"> </li>
        <li class="list-group-item font-weight-bold">rank </li>
        <li class="list-group-item font-weight-bold" style="width:160px">Name </li>
        <li class="list-group-item font-weight-bold">Meeting </li>
        <li class="list-group-item font-weight-bold">Tasks </li>
        <li class="list-group-item font-weight-bold">Total </li>
        <li class="list-group-item font-weight-bold">% </li>
    </ul>
</li>`;
    users.map(user => pushUserIntoLeaderboard(user));
}

const pushUserIntoLeaderboard = (user) => {
    const colors = ['gold', 'silver', 'brown']
    const leaderboardSection = document.querySelector('#leaderboard');
    const medal = user.rank < 4 ? `<i class="fas fa-medal" style="color:${colors[user.rank - 1]};font-size:18px"></i> ` : '';
    console.log(user);
    const innerHtml = `
    
    <li class="list-item">
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item"><img id="memberPhoto${user.uid}" style="width:50px;height:50px;border-radius:50%;" 
        src="https://www.pngitem.com/pimgs/m/512-5125598_computer-icons-scalable-vector-graphics-user-profile-avatar.png"/>
        <li class="list-group-item " style="width:73px">${user.rank} ${medal} </li>
        <li class="list-group-item " style="width:200px">${user.name} </li>
        <li class="list-group-item ">${user.degree.meetingDegree.userDegree}/${user.degree.meetingDegree.totalDegrees} </li>
        <li class="list-group-item ">${user.degree.taskDegree.userDegree}/${user.degree.taskDegree.totalDegrees} </li>
        <li class="list-group-item ">${user.degree.userTotalDegree}/${user.degree.absoluteTotalDegree} </li>
        <li class="list-group-item ">${user.degree.percentage}% </li>
    </ul>
</li>    `
    getUserImage(user);
    leaderboardSection.innerHTML += innerHtml;
}
const getUserImage = (user) => {
    console.log(document.querySelector('#memberPhoto'));
    membersImagesRef.child(user.uid + '.jpg').getDownloadURL()
        .then(url => document.querySelector(`#memberPhoto${user.uid}`).src = url)
        .catch(err => console.log(err));
}
const sortRanks = (users) => {
    console.log(users);
    let sorted_users = users.map(user => {
        user.degree = getDetailedDegree(user);
        return user;
    }).sort((user1, user2) => user2.degree.percentage - user1.degree.percentage);
    let current = sorted_users[0].degree.percentage;
    let rank = 1;
    let count=1;
    sorted_users.forEach(user => {
        if (user.degree.percentage == current) {
            user.rank = rank;
        }
        else {
            user.rank = count;
            rank=count;
            current = user.degree.percentage;
        }
        count++
    })
    return sorted_users;
}
const getDetailedDegree = (user) => {
    const taskDegree = getTasksDegree(user);
    const meetingDegree = getMeetingDegree(user);
    const userTotalDegree = taskDegree.userDegree + meetingDegree.userDegree;
    const absoluteTotalDegree = taskDegree.totalDegrees + meetingDegree.totalDegrees;
    const percentage = userTotalDegree / absoluteTotalDegree * 100;
    return (
        {
            taskDegree: taskDegree,
            meetingDegree: meetingDegree,
            userTotalDegree: userTotalDegree,
            absoluteTotalDegree: absoluteTotalDegree,
            percentage: percentage.toFixed(2)
        }
    )
}
const getMeetingDegree = (user) => {
    let totalDegrees = 0;
    let userDegree = 0;
    const tasks = Object.keys(user.tasks).filter(task => user.tasks[task].type.toLowerCase() == 'meeting' & user.tasks[task].month == month.value).map(key => user.tasks[key]);
    totalDegrees = tasks.length * 10;
    console.log(tasks);
    tasks.forEach(task => {
        userDegree += parseInt(task.value);
        if (task.name.toLowerCase() == "hrd")
            totalDegrees += 20;
    }
    );
    return {
        userDegree: userDegree,
        totalDegrees: totalDegrees,
    };
}
const getTasksDegree = (user) => {
    let totalDegrees = 0;
    let userDegree = 0;
    const tasks = Object.keys(user.tasks).filter(task => user.tasks[task].type.toLowerCase() == 'task' & user.tasks[task].month == month.value).map(key => user.tasks[key]);
    totalDegrees = tasks.length * 10;
    console.log(tasks);
    tasks.forEach(task => {
        userDegree += parseInt(task.value);
        if (task.name.toLowerCase() == "hrd")
            totalDegrees += 20;
    }
    );
    return {
        userDegree: userDegree,
        totalDegrees: totalDegrees,
    };
}
