import Arweave from 'arweave/web';

const arweave = Arweave.init();

const TAG_KEY = "Content-Type" ;
const TAG_VALUE = "audio" ;

const APP_NAME_KEY = "App-Name";
const APP_NAME = "musicplayer2";

let CURRENT_SONG_IDS = [];

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}

const arql = async (jwk) => {
    let owner = await arweave.wallets.jwkToAddress(jwk);
    return {
        op: "and",
        expr1: {
          op: "equals",
          expr1: APP_NAME_KEY,
          expr2: APP_NAME,
        },
        expr2: {
          op: "equals",
          expr1: "from",
          expr2: owner,
        }
    };
}
export const removeAudio = async (index, jwk) => {
    CURRENT_SONG_IDS.splice(index, 1);

    let transaction = await arweave.createTransaction({
        data: JSON.stringify(CURRENT_SONG_IDS),
    }, jwk)
    transaction.addTag(APP_NAME_KEY, APP_NAME);
    let owner = await arweave.wallets.jwkToAddress(jwk);    
    transaction.addTag("from", owner);

    const anchor_id = await arweave.api.get('/tx_anchor').then(x => x.data);
    transaction.last_tx = anchor_id;

    await arweave.transactions.sign(transaction, jwk);
    await arweave.transactions.post(transaction);

}
export const getAudios = async (jwk) => {
    const txids = await arweave.arql(await arql(jwk));
    if(txids.length > 0){
        const main_transaction = await arweave.transactions.get(txids[0]);
        var song_ids = JSON.parse(main_transaction.get('data', {decode: true, string: true}));
        CURRENT_SONG_IDS = song_ids;

        let x = await Promise.all(await song_ids.map( async (id) => {
            const transaction = await arweave.transactions.get(id);
            var o = JSON.parse(transaction.get('data', {decode: true, string: true}));
            return dataURLtoFile(o.base64, o.name);
        }));
        return x;
    }else{
        return [];
    }
}
export const uploadMusics = async (files, jwk) => {
    let txs = [];
    await uploadMusic(files, 0, txs, jwk);
    let song_ids = txs.map(o=> o.id);

    song_ids = CURRENT_SONG_IDS.concat(song_ids);
    CURRENT_SONG_IDS = song_ids;

    let transaction = await arweave.createTransaction({
        data: JSON.stringify(song_ids),
    }, jwk)
    transaction.addTag(APP_NAME_KEY, APP_NAME);
    let owner = await arweave.wallets.jwkToAddress(jwk);    
    transaction.addTag("from", owner);

    const anchor_id = await arweave.api.get('/tx_anchor').then(x => x.data);
    transaction.last_tx = anchor_id;

    await arweave.transactions.sign(transaction, jwk);
    await arweave.transactions.post(transaction);
}
export const uploadMusic = async (files, n, txs, jwk) => {
        let file = files[n];
        let result = (await readAudio(file)).target.result;
        let transaction = await arweave.createTransaction({
            data: JSON.stringify({
                base64: result,
                name: file.name,
                size: file.size,
                lastModified: file.lastModified,
                type: file.type,
            }),
        }, jwk);
        transaction.addTag(TAG_KEY, TAG_VALUE);
        const anchor_id = await arweave.api.get('/tx_anchor').then(x => x.data);
        transaction.last_tx = anchor_id;
        await arweave.transactions.sign(transaction, jwk);
        n++;
        
        const response = await arweave.transactions.post(transaction);
        if(response.status == 200){
            txs.push(transaction);
        }
        if(n < files.length){
            await uploadMusic(files, n, txs, jwk);
        }
}
    
const readAudio = (file) => {
    var reader = new FileReader();
    const  fileType = file['type'];
    const validAudioTypes = ['audio/mpeg', ' 	audio/aac', 'audio/ogg', 'audio/wav'];
    if (!validAudioTypes.includes(fileType)) {
        alert(`Invalid Audio, currently only supports ${validAudioTypes.join(", ")} !`);
        return false;
    }
    reader.readAsDataURL(file);

    return new Promise(function(resolve, reject) {
        reader.onloadend = resolve;
    });
  }