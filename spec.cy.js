describe('Testing https://sweetshop.netlify.app/', () => {
  beforeEach(() => {
    cy.visit('https://sweetshop.netlify.app/');
  });

  it('Login to dashboard', () => {
    cy.get('a.nav-link[href="/login"]').click();
    cy.get('input[type="email"]').type('evg3niy.demchenko@yandex.ru');
    cy.get('input[type="password"]').type('1234');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/00efc23d-b605-4f31-b97b-6bb276de447e.html');
  });

  it('Browse sweets and add first to basket', () => {
    cy.get('a.btn[href="/sweets"').click();
    cy.url().should('include', '/sweets');
    cy.get(':nth-child(2) > :nth-child(1) > .card > .card-footer > .btn').click();
    cy.get('.badge').should('have.text', '1');
  });

  it('Add all popular sweets on general page to basket', () => {
    cy.get('.card').then(($cards) => {
      const cardsCount = $cards.length;
      cy.log(`Number of sweets: ${cardsCount}`);

      cy.get('a.btn[data-id]').each(($el) => {
        cy.wrap($el).click();
      });
      cy.get('.badge').should('have.text', cardsCount);
    });
  });

  // Баг? Cypress видит, что там значение не 0, а 00
  it('Delete sweet from backet', () => {
    cy.get('a.btn[href="/sweets"').click();
    cy.url().should('include', '/sweets');
    cy.get(':nth-child(2) > :nth-child(1) > .card > .card-footer > .btn').click();
    cy.get('.badge').should('have.text', '1');
    cy.get('a.nav-link[href="/basket"]').click();
    cy.url().should('include', '/basket');
    cy.get('.small').click();
    cy.on('window:confirm', () => {
      return true;
    });
    cy.get('.badge').should('have.text', '0');
  });

  // Баг, неправильно подсчитывает
  it('Calculate price with sweet and Standard Shipping delivery', () => {
    cy.get('a.btn[href="/sweets"').click();
    cy.url().should('include', '/sweets');
    cy.get(':nth-child(2) > :nth-child(1) > .card > .card-footer > .btn').click();
    cy.get('.badge').should('have.text', '1');
    cy.get('a.nav-link[href="/basket"]').click();
    cy.url().should('include', '/basket');
    cy.get('label[for="exampleRadios2"]').click();

    cy.get('.lh-condensed > span.text-muted')
      .invoke('text')
      .then((text) => {
        const valueWithoutPound = text.replace('£', '').trim();
        cy.wrap(valueWithoutPound).as('sweetPrice');
      });

    cy.get('strong')
      .invoke('text')
      .then((text) => {
        const valueWithoutPound = text.replace('£', '').trim();
        cy.wrap(valueWithoutPound).as('totalPrice');
      });

    cy.get('@sweetPrice').then((sweetPrice) => {
      const sweetPriceNumber = parseFloat(sweetPrice) + 1.99;

      cy.get('@totalPrice').then((totalPrice) => {
        const totalPriceNumber = parseFloat(totalPrice);

        expect(sweetPriceNumber).to.equal(totalPriceNumber);
      });
    });
  });

  it('Order sweet in backet', () => {
    cy.get('a.btn[href="/sweets"').click();
    cy.url().should('include', '/sweets');
    cy.get(':nth-child(2) > :nth-child(1) > .card > .card-footer > .btn').click();
    cy.get('.badge').should('have.text', '1');
    cy.get('a.nav-link[href="/basket"]').click();
    cy.url().should('include', '/basket');
    cy.get(':nth-child(1) > #name').type('Evgeny');
    cy.get(':nth-child(2) > #name').type('Demchenko');
    cy.get('#email').type('evg3niy.demchenko@gmail.com');
    cy.get('#address').type('Izhevsk');
    cy.get('#country').select('United Kingdom');
    cy.get('#city').select('Bristol');
    cy.get('#zip').type('426000');
    cy.get('#cc-name').type('EVGENIY');
    cy.get('#cc-number').type('7971176356719016');
    cy.get('#cc-expiration').type('2025');
    cy.get('#cc-cvv').type('111');
    cy.get('.needs-validation > .btn').click();
    cy.url().should('include', '/basket');
  });
});
