console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain } = require('electron')

// Esta linha esta relacionada ao preload.js
const path = require('node:path')

// Importação dos metodos conectar e desconectar (modulo de conexão)
const{ conectar, desconectar } = require('./database')

// Janela principal
let win
const createWindow = () => {
  // a linha abaixo define o tema (claro ou escuro)
  nativeTheme.themeSource = 'dark' //(dark ou light)
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // autoHideMenuBar: true,
    // minimizable: false,
    resizable: false,
    // ativação do preload.js
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('./src/views/index.html')

  // recebimento dos pedidos do renderizador para abertura de janelas (botoes)
  // autorizado no preload.js
  ipcMain.on('client-window', () => {
    clientWindow()
  })

  ipcMain.on('os-window', () => {
    osWindow()
  })
}

// Janela sobre 
function aboutwindows() {
  nativeTheme.themeSource = 'light'
  // a linha abaixo obtem a janela principal
  const main = BrowserWindow.getFocusedWindow()
  let about
  // Estabelece uma relação hierárquica entre janelas
  if (main) {
    // Criar a janela sobre
    about = new BrowserWindow({
      width: 360,
      height: 200,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true
    })
  }

  // Carregar o documento html na janela
  about.loadFile('./src/views/sobre.html')
}

// janela clientes
let client
function clientWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client = new BrowserWindow({
      width: 1010,
      height: 720,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true
    })
  }
    client.loadFile('./src/views/cliente.html')
    client.center()
  
}

// janela OS
let os
function osWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    os = new BrowserWindow({
      width: 1010,
      height: 720,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true
    })
  }
  os.loadFile('./src/views/os.html')
  os.center()
}

// Iniciar a aplicação 
app.whenReady().then(() => {
  createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })


// Reduzir logs não criticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados
ipcMain.on('db-connect', async (event) => {
  let conectado = await conectar()
  // se conectado for igual a true 
  if (conectado){
    // enviar uma mensagem para o renderizador trocar o ícone, criar um dalay de 0.5s para sincronizar a nuvem
    setTimeout(()=>{
      event.reply('db-status',"conectado")
    }, 500) //500ms
      
    }
  
})
// se conectado for igual a true


// iniciar a conexão com o banco de dados
// conectar()

// IPORTANTE Desconectar do banco de dadois quando a aplicação for encerrada
app.on('before-quit', ()=>{
  desconectar()
})

// Template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Clientes',
        click: () => clientWindow()
      },
      {
        label: 'OS',
        click: () => osWindow()
      },
      {
        type: 'separator'
      },
      {
        label: 'Sair',
        click: () => app.quit(),
        accelerator: 'Alt+F4'
      }
    ]
  },

  {
    label: 'Relatórios',
    submenu: [
      {
        label: "Clientes"
      },
      {
        label: "OS abertas"
      },
      {
        label: "OS concluídas"
      }
    ]
  },

  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut',
      },
      {
        label: 'Restaurar o zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'Ferramentas do desenvolvedor',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Sobre',
        click: () => aboutwindows()
      }
    ]
  }
]

