describe('PersonController API Test', () => {
  const duey = {
    name: 'Duey'
  };

  const huey = {
    name: 'Huey'
  };

  const luey = {
    name: 'Luey'
  };

  beforeEach(() => {
    cy.request('GET', '/api/ducks').then((response) => {
      response.body.forEach(duck => {
        cy.request('DELETE', `/api/ducks/${duck.uid}`);
      });
    });
  });

  it('should return three ducks', () => {
    return cy.request('POST', '/api/ducks', duey)
    .then((response) => {
      expect(response.status).to.eq(201);
    })
    .then(() => {
      return cy.request('POST', '/api/ducks/', huey);
    })
    .then((response) => {
      expect(response.status).to.eq(201);
    })
    .then(() => {
      return cy.request('POST', '/api/ducks/', luey);
    })
    .then((response) => {
      expect(response.status).to.eq(201);
    })
    .then(() => {
      return cy.request('GET', '/api/ducks/');
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(3);
    });
  });

  it('should return one duck by UID', () => {
    let duckUid;

    return cy.request('POST', '/api/ducks/', huey)
    .then((response) => {
      expect(response.status).to.eq(201);
      duckUid = response.body.uid;
    })
    .then(() => {
      return cy.request('GET', `/api/ducks/${duckUid}`);
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('uid', duckUid);
      expect(response.body).to.deep.include({
        name: 'Huey'
      });
    });
  });

  it('should create duck', () => {
    cy.request('POST', '/api/ducks', duey).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('uid');
      expect(response.body.name).to.eq('Duey');
    });
  });

  it('should update duck', () => {
    let duckUid;

    return cy.request('POST', '/api/ducks', huey)
    .then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.deep.include(huey);
      duckUid = response.body.uid;
    })
    .then(() => {
      const updatedDuck = {
        ...huey,
        uid: duckUid,
        name: 'Hupu'
      };

      return cy.request('PUT', `/api/ducks/${duckUid}`, updatedDuck);
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('uid', duckUid);
      expect(response.body).to.deep.include({
        name: 'Hupu'
      });
    });
  });

  it('should delete duck', () => {
    let duckUid;

    return cy.request('POST', '/api/ducks', luey)
    .then((response) => {
      expect(response.status).to.eq(201);
      duckUid = response.body.uid;
    })
    .then(() => {
      return cy.request('DELETE', `/api/ducks/${duckUid}`);
    })
    .then((response) => {
      expect(response.status).to.eq(204);
    })
    .then(() => {
      cy.request({
        method: 'GET',
        url: `/api/ducks/${duckUid}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
