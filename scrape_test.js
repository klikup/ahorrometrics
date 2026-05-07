const fs=require('fs');
const cheerio=require('cheerio');
const $=cheerio.load(fs.readFileSync('kelisto.html'));

const providers = [];
$('div[data-provider]').each((i, el) => {
    const provider = $(el).attr('data-provider');
    providers.push(provider);
});
console.log("Found providers by data-provider:", providers.length ? providers.slice(0,5) : "none");

// Just log some text
console.log($('h3').first().text());
