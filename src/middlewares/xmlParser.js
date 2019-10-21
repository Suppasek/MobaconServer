const xmlParser = (req, res, next) => {
  if (req.headers['content-type'] === 'application/xml') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else next();
};

module.exports = xmlParser;
