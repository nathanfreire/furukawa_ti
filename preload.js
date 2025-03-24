/**
 * Arquivos de pré carregamento (mais desempenho) e reforço de segurança na comunicação entre processos (IPC)
 */

const { contextBridge, ipcRenderer } = require('electron')

// Enviar ao main um pedido para conexão do banco de dados e trca do icone no processo de renderização(index.html - renderer.html)
ipcRenderer.send('db-connect')


// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message)
})

/*function dbStatus(message){
    ipcRenderer.on('db-status', message)
}*/