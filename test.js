const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

describe('LNURL Withdraw API', () => {
  const server = 'http://localhost:3000'; // Replace with your server address

  it('should return an error for requests without an amount', (done) => {
    chai.request(server)
      .get('/generate-lnurl-withdraw')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should generate LNURL and QR code for valid requests', (done) => {
    chai.request(server)
      .get('/generate-lnurl-withdraw?amount=1000')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('lnurl');
        expect(res.body).to.have.property('qrCode');
        done();
      });
  });
});
