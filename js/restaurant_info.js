let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.setAttribute('tabindex', '0'); // Make it accessible.
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.setAttribute('tabindex', '0'); // Make it accessible.
  address.innerHTML = restaurant.address;
// picture
  const picture = document.querySelector('picture');
  let imageUrl = DBHelper.imageUrlForRestaurant(restaurant);
  
  const img_source1 = document.createElement('source');
  img_source1.media = '(min-width: 550px)';
  img_source1.srcset = `${imageUrl}_small2x.jpg`;

  const img_source2 = document.createElement('source');
  img_source2.srcset = `${imageUrl}_small.jpg, ${imageUrl}_small2x.jpg 2x, ${imageUrl}_small2x.jpg 3x`
  
  const img_source3 = document.createElement('source');
  img_source3.media = '(min-width: 550px)';
  img_source3.srcset = `${imageUrl}_small2x.webp`;

  const img_source4 = document.createElement('source');
  img_source4.srcset = `${imageUrl}_small.webp, ${imageUrl}_small2x.webp 2x, ${imageUrl}_small2x.webp 3x`
  
  picture.prepend(img_source2); // 3 and 4 for browsers that supports  webp formats
  picture.prepend(img_source1);
  picture.prepend(img_source4);
  picture.prepend(img_source3);
  //picture
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = `${imageUrl}_small2x.jpg`;
  image.alt = `${restaurant.name} image.`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.setAttribute('tabindex', '0'); // Make it accessible.

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h4');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('tabindex', '0'); // Make it accessible.
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// remove focus from google map for keyboard users.
document.querySelector('.inside #breadcrumb a').addEventListener('keydown', skipMap);
document.querySelector('#restaurant-name').addEventListener('keydown', skipMap2);

function skipMap(e) {
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      document.querySelector('a').focus();
    } else {
      document.querySelector('#restaurant-name').focus();
    }
  }
  e.preventDefault();
}

function skipMap2(e) {
  if (e.keyCode === 9 && e.shiftKey) {
      document.querySelector('.inside #breadcrumb a').focus();
      e.preventDefault();
  }
}