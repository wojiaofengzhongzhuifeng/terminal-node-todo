const inquirer = require('inquirer');
const fs = require('fs');
const homePath = require('os').homedir();
const path = require('path');
const todoFilePath = path.join(homePath, '.todos');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'userWant',
      message: '请选择要做的事情',
      choices: [
        {
          name: '查看所有任务',
          value: 'showAll'
        },
        {
          name: '增加一个任务',
          value: 'addTodo'
        },
      ]
    },
  ])
  .then(async userSelect => {
    const userWantAction = userSelect.userWant;
    console.log(userWantAction);
    switch (userWantAction) {
      case 'showAll':
        await showAll();
        break;
      case 'addTodo':
        console.log(1);
        addTodo();
        break;
    }
  });

async function showAll(){
  try{
    const allTodos = await getAllTodosFromFile();
    console.log('allTodos', allTodos);
    xxxxx(allTodos);
    return allTodos;
  }catch (e) {
    console.log(e);
  }
}

function addTodo(){
  inquirer.prompt({
    type: 'input',
    name: 'addTodoTitle',
    message: "请输入 todo 名称",
    validate: async function (value) {
      try{
        const allTodos = await getAllTodosFromFile();
        allTodos.push({
          title: value,
          status: 'undo',
        });
        fs.writeFile(todoFilePath, JSON.stringify(allTodos), (err) => {
          if (err) {
            console.log(err)
          }
          console.log('新增 todo 成功');
        })
      }catch (e) {
        console.log(e);
      }
      return true;
    }
  })
}

function editTodoTitle(oldTodoTitle){
  inquirer.prompt({
    type: 'input',
    name: 'editTodoTitle',
    message: "请修改任务名称",
    validate: async function (newTodoTitle) {
      try{
        const allTodos = await getAllTodosFromFile();
        const editTodo = allTodos.find(todo => todo.title === oldTodoTitle);
        editTodo.title = newTodoTitle;
        fs.writeFile(todoFilePath, JSON.stringify(allTodos), (err) => {
          if (err) {
            console.log(err)
          }
          console.log(`成功将「${oldTodoTitle}」修改成「${newTodoTitle}」`);
          showAll();
        })
      }catch (e) {
        console.log(e);
      }
      return true;
    }
  })
}

async function toggleTodoStatus(userSelectTitle){
  try{
    const allTodos = await getAllTodosFromFile();
    let resultLog;
    const editTodo = allTodos.find(todo => todo.title === userSelectTitle);
    if(editTodo.status === 'undo'){
      editTodo.status = 'done';
      resultLog = "完成"
    } else {
      editTodo.status = 'undo';
      resultLog = '未完成'
    }
    fs.writeFile(todoFilePath, JSON.stringify(allTodos), (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`成功将「${userSelectTitle}」设置为${resultLog}`);
      showAll();
    })
  }catch (e) {
    console.log(e);
  }
}

async function deleteTodo(userSelectTitle){
  try{
    const allTodos = await getAllTodosFromFile();
    const wantToDelete = allTodos.find(todo => todo.title === userSelectTitle);
    const deleteIndex = allTodos.indexOf(wantToDelete);
    if (deleteIndex > -1) {
      allTodos.splice(deleteIndex, 1);
    }
    fs.writeFile(todoFilePath, JSON.stringify(allTodos), (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`成功将「${userSelectTitle}」删除`)
      showAll();
    })
  }catch (e) {
    console.log(e);
  }
}

function getAllTodosFromFile(){
  return new Promise((resolve, reject)=>{
    fs.readFile(todoFilePath, {
      flag: 'a+'
    }, (err, data)=>{
      if(err){reject(err);}
      let list;
      try{
        list = JSON.parse(data);
      }catch(e){
        list = [];
      }
      resolve(list);
    });
  });
}

function xxxxx(allTodos){
  let allTodoCheckBox = allTodos.map((todo)=>{
    if(todo.status === 'undo'){
      return {
        name: `❎ ${todo.title}`,
        value: todo.title,
      }
    } else {
      return {
        name: `✅ ${todo.title}`,
        value: todo.title,
      }
    }
  });
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'userSelectTitle',
        message: '以下是所有的 todo, 可以选择之后修改标题或者切换完成状态',
        choices: allTodoCheckBox
      },
    ])
    .then(async userSelect => {
      const userSelectTitle = userSelect.userSelectTitle;
      inquirer.prompt([
        {
          type: 'list',
          name: 'changeTitleOrStatus',
          message: `正在修改「${userSelectTitle}」任务`,
          choices: [
            {
              name: '修改标题',
              value: 'changeTitle',
            },
            {
              name: '修改状态',
              value: 'changeStatus',
            },
            {
              name: '删除任务',
              value: 'deleteTodo',
            }
          ]
        },
      ]).then((options)=>{
        const changeTitleOrStatus = options.changeTitleOrStatus;
        if(changeTitleOrStatus === 'changeTitle'){
          // 弹出 input 供用户修改任务标题
          editTodoTitle(userSelectTitle);
        } else if(changeTitleOrStatus === 'changeStatus'){
          // 切换任务完成状态
          toggleTodoStatus(userSelectTitle);
        } else if (changeTitleOrStatus === 'deleteTodo'){
          deleteTodo(userSelectTitle);
        }
      })
    });
}

