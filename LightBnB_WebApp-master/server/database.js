const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'ivanchew',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  // Use pool.query to execute the query and return a Promise that resolves with the user object
  return pool.query(`
    SELECT *
    FROM users
    WHERE LOWER(email) = $1
    LIMIT 1;
  `, [email.toLowerCase()])
    .then((result) => {
      // If a user is found, return the user object
      if (result.rows.length > 0) {
        return result.rows[0];
      } 
      // If no user is found, return null
      else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT *
  FROM users
  WHERE (id) = $1
  LIMIT 1;
`, [id])
  .then((result) => {
    // If a user is found, return the user object
    if (result.rows.length > 0) {
      return result.rows[0];
    } 
    // If no user is found, return null
    else {
      return null;
    }
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
  .query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `, [user.name, user.email, user.password]
)
.then((result) => {
  return result.rows[0];
})
.catch((err) => {
  console.log(err.message);
});
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {

return pool.query(`
SELECT reservations.id, properties.title, properties.cost_per_night,
reservations.start_date, reservations.end_date, avg(rating) as average_rating, 
thumbnail_photo_url, parking_spaces, number_of_bathrooms, number_of_bedrooms
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = $1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;
`, [guest_id])
  .then((result) => {
    // If a user is found, return the user object
    if (result.rows.length > 0) {
      return result.rows;
    } 
    // If no user is found, return null
    else {
      return null;
    }
  })
  .catch((err) => {
    console.log(err.message);
  });
};

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
   
// helper function for constructing the query search
const queryBuilder = function(queryParams, options) {
  let emptyQueryHolder = '';

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    emptyQueryHolder += `AND city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    emptyQueryHolder += `AND cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    emptyQueryHolder += `AND cost_per_night <=  $${queryParams.length} `;
  }

  return emptyQueryHolder;
}

// helper function for the query LIMIT
const limitQuery = function(queryParams, limit) {
  queryParams.push(limit);
  return `LIMIT $${queryParams.length}`;
}

  // Setup an array to hold any parameters that may be available for the query.
   const queryParams = [];
   // Start the query with all information that comes before the WHERE clause.
   let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
   `;
   queryString += queryBuilder(queryParams, options);
   queryString += `
   GROUP BY properties.id
   ORDER BY cost_per_night
   `;
   queryString += limitQuery(queryParams, limit);


   // Check if a city has been passed in as an option. Add the city to the params array and create a WHERE clause for the city.
   /* if (options.city) {
     queryParams.push(`%${options.city}%`);
     queryString += `WHERE city LIKE $${queryParams.length} `;
   }


   // Add any query that comes after the WHERE clause.
   queryParams.push(limit);
   queryString += `
   GROUP BY properties.id
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;
 */
   // Console log everything just to make sure we've done it right.
   console.log(queryString, queryParams);
 
   // Run the query.
   return pool.query(queryString, queryParams).then((res) => res.rows);
 };

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
