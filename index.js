const {Client, MessageMedia} = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');
const { default: axios } = require('axios');

const client = new Client();
const IMAGE_TYPE = 'image/jpeg';
const IMAGE_NAME = 'image.jpg';

client.on('qr', qr => {
    qrCode.generate(qr, {small: true});
});

client.on('ready', () => console.log('connected to a client'));

client.on('message_create', async (message) => {
    if (message.body.toLowerCase() === 'hello') {
        message.reply('arriégua!');
    } else {
        const command = message.body.toLowerCase().split(' ')[0];

        const {to, from, fromMe} = message;

        const sender = fromMe ? to : from;

        if (command === "/sticker") {
            console.log('generating sticker for', sender);

            generateSticker(message, sender);
        }
    }
});

const generateSticker = (message, sender) => {    
    if (message.type === 'image') {
        replyMediaWithSticker(message, sender);
    } else {
        replyUrlWithSticker(message, sender);
    }
}

const replyMediaWithSticker = async (message, sender) => {
    try {
        const {data} = await message.downloadMedia();

        const image = createMessageMedia(data);

        await client.sendMessage(sender, image, {sendMediaAsSticker: true});
    } catch (error) {
        message.reply('Erro ao processar a imagem :c');
    }
}

const replyUrlWithSticker = async (message, sender) => {
    try {
        const url = message.body.substring(message.body.indexOf(' ')).trim();
    
        const {data} = await axios.get(url, {responseType: 'arraybuffer'});

        const returnedBaseSixtyFour = Buffer.from(data).toString('base64');

        const image = createMessageMedia(returnedBaseSixtyFour);

        await client.sendMessage(sender, image, {sendMediaAsSticker: true});
    } catch (error) {
        message.reply('Erro ao processar a url para gerar um sticker :c');
    }
}

const createMessageMedia = (data) => {
    return new MessageMedia(IMAGE_TYPE, data, IMAGE_NAME);
}

client.initialize();