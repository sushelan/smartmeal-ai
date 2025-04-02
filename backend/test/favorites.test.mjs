// favorites.test.mjs
import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Favorites Endpoints', function() {
  const agent = request.agent(app);
  let testIngredient;
  let testDish;

  before(async function() {
    const email = `testuser_${Date.now()}@example.com`;
    const signupResponse = await agent
      .post('/api/auth/signup')
      .send({
        email,
        password: 'password123',
        name: 'Test User'
      });
    expect(signupResponse.status).to.equal(201);
    expect(signupResponse.body).to.have.property('user');
  });

  describe('Favorite Ingredients', function() {
    it('should add a favorite ingredient', async function() {
      const ingredient = 'Tomato';
      const response = await agent
        .post('/api/favorites/ingredients')
        .send({ ingredient });
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('favorite');
      expect(response.body.favorite).to.include({ ingredient });
      testIngredient = response.body.favorite;
    });

    it('should retrieve favorite ingredients', async function() {
      const response = await agent.get('/api/favorites/ingredients');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('favorites');
      expect(response.body.favorites).to.be.an('array');
      const found = response.body.favorites.some(item => item.ingredient === 'Tomato');
      expect(found).to.be.true;
    });

    it('should delete a favorite ingredient', async function() {
      const response = await agent
        .delete(`/api/favorites/ingredients/${testIngredient.id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      const getResponse = await agent.get('/api/favorites/ingredients');
      const found = getResponse.body.favorites.some(item => item.id === testIngredient.id);
      expect(found).to.be.false;
    });
  });

  describe('Favorite Dishes', function() {
    it('should add a favorite dish', async function() {
      const dish = 'Pizza';
      const response = await agent
        .post('/api/favorites/dishes')
        .send({ dish });
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('favorite');
      expect(response.body.favorite).to.include({ dish });
      testDish = response.body.favorite;
    });

    it('should retrieve favorite dishes', async function() {
      const response = await agent.get('/api/favorites/dishes');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('favorites');
      expect(response.body.favorites).to.be.an('array');
      const found = response.body.favorites.some(item => item.dish === 'Pizza');
      expect(found).to.be.true;
    });

    it('should delete a favorite dish', async function() {
      const response = await agent
        .delete(`/api/favorites/dishes/${testDish.id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      const getResponse = await agent.get('/api/favorites/dishes');
      const found = getResponse.body.favorites.some(item => item.id === testDish.id);
      expect(found).to.be.false;
    });
  });
});
