document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connect');
    const enrollCommandButton = document.getElementById('enrollCommand');
    const identifyCommandButton = document.getElementById('identifyCommand');
    const consoleDiv = document.getElementById('console');
    const interfaceDiv = document.getElementById('interface');
    let device, server, service, characteristicWrite, characteristicRead;

    connectButton.addEventListener('click', () => {
        connectBluetooth().then(() => {
            console.log('Bluetooth device connected');
            interfaceDiv.classList.remove('hidden');
            addToConsole('Bluetooth device connected');
        }).catch(error => {
            console.error('Connection failed:', error);
            addToConsole(`Connection failed: ${error}`);
        });
    });

    enrollCommandButton.addEventListener('click', () => {
        sendCommand(':02,01,01,04@');
    });

    identifyCommandButton.addEventListener('click', () => {
        sendCommand(':03,00,03@');
    });

    async function connectBluetooth() {
        const options = {
            filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }],
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
        };

        device = await navigator.bluetooth.requestDevice(options);
        server = await device.gatt.connect();
        service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        characteristicWrite = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
        characteristicRead = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        characteristicRead.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        await characteristicRead.startNotifications();
    }

    async function sendCommand(command) {
        const encoder = new TextEncoder();
        const data = encoder.encode(command);
        await characteristicWrite.writeValue(data);
        addToConsole(`Sent: ${command}`);
    }

    function handleCharacteristicValueChanged(event) {
        const value = new TextDecoder().decode(event.target.value);
        addToConsole(`Received: ${value}`);
    }

    function addToConsole(message) {
        consoleDiv.textContent += `${message}\n`;
    }
});
