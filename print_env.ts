console.log(Object.keys(process.env).filter(k => !k.toLowerCase().includes('secret') && !k.toLowerCase().includes('key') && !k.toLowerCase().includes('auth')));
