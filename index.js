const {Client, MessageMedia} = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');
const { default: axios } = require('axios');

const client = new Client();
                   
let fileMimetype = 'image/jpeg';
let fileExtension = 'jpg';

const ALLOWED_TYPES = ['image', 'video'];

client.on('qr', qr => {
    qrCode.generate(qr, {small: true});
});

client.on('ready', () => console.log('connected to a client'));

client.on('message_create', (message) => {
    if (message.body.toLowerCase() === 'hello') {
        message.reply('arriégua!');
    } else {
        const command = message.body.toLowerCase().split(' ')[0];

        if (command === "/sticker") {
            const {to, from, fromMe} = message;
            
            const sender = fromMe ? to : from;
    
            console.log('generating sticker for', sender);

            generateSticker(message, sender);
        }
    }
});

const generateSticker = (message, sender) => {    
    if (ALLOWED_TYPES.includes(message.type)) {
        replyMediaWithSticker(message, sender);
    } else {
        replyUrlWithSticker(message, sender);
    }
}

const replyMediaWithSticker = async (message, sender) => {
    try {
        const {data, mimetype} = await message.downloadMedia();

        if (message.isGif) {
            fileMimetype = `image/gif`;

            fileExtension = 'gif';
        } else {
            fileMimetype = mimetype;
            
            fileExtension = 'jpg';
        }

        console.log('look:', mimetype, message.isGif);
        console.log(fileExtension, fileMimetype);
        
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
    return new MessageMedia(fileMimetype, data, `image.${fileExtension}`);
}

client.initialize();