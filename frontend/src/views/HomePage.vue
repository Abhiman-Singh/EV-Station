<template>
  <div class="home-page">
    <header class="home-header">
      <div class="container header-content">
        <h1><i class="fas fa-bolt"></i> Welcome to EV Station Management</h1>
        <p class="tagline">Your ultimate solution for managing and discovering electric vehicle charging points efficiently.</p>
        <div class="cta-buttons">
          <router-link to="/login" class="btn primary-btn"><i class="fas fa-sign-in-alt"></i> Login</router-link>
          <router-link to="/login" class="btn secondary-btn"><i class="fas fa-user-plus"></i> Register</router-link> 
          </div>
      </div>
    </header>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title"><span>Key Features</span></h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon-wrapper">
              <i class="icon fas fa-list-alt"></i>
            </div>
            <h3>Comprehensive Listing</h3>
            <p>View, add, edit, and delete charging stations with all necessary details and intuitive controls.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">
              <i class="icon fas fa-map-marked-alt"></i>
            </div>
            <h3>Interactive Map View</h3>
            <p>Discover stations visually on a dynamic map. Click to add new locations with address auto-fetch.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">
              <i class="icon fas fa-cogs"></i>
            </div>
            <h3>Detailed Management</h3>
            <p>Track status, power output, connector types, and precise location data effortlessly.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">
              <i class="icon fas fa-filter"></i> </div>
            <h3>Powerful Filters</h3>
            <p>Easily search and filter stations by name, status, connector type, and power output for quick access.</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} EV Charging Station Management. All rights reserved.</p>
        </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  mounted() {
    if (localStorage.getItem('token')) {
      this.$router.push('/chargers');
    }
  }
};
</script>

<style scoped>
:root { /* Define CSS custom properties for theming if not using a preprocessor */
  --primary-color: #007bff;
  --primary-darker-color: #0056b3;
  --secondary-color: #6c757d;
  --accent-color: #28a745; /* Green for primary CTA */
  --accent-darker-color: #1e7e34;
  --light-bg-color: #f8f9fa;
  --white-color: #ffffff;
  --text-color-dark: #212529;
  --text-color-light: #f8f9fa;
  --text-color-muted: #6c757d;
  --border-color: #dee2e6;
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 50px; /* For pill buttons */
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  --font-family-sans-serif: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.home-page {
  font-family: var(--font-family-sans-serif, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
  color: var(--text-color-dark, #333);
  background-color: var(--white-color, #ffffff); /* Changed base background to white */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.container {
  width: 90%;
  max-width: 1140px; /* Standard container width */
  margin: 0 auto;
  padding: 0 15px; /* Consistent padding */
}

/* --- Header --- */
.home-header {
  background: linear-gradient(135deg, var(--primary-color, #007bff) 0%, var(--primary-darker-color, #0056b3) 100%);
  color: var(--text-color-light, white);
  padding: 100px 0 80px; /* Increased top padding */
  text-align: center;
  position: relative; /* For potential pseudo-elements or overlays */
  clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%); /* Angled bottom */
  margin-bottom: -60px; /* Overlap next section slightly due to clip-path, adjust as needed */
  z-index: 1;
}
.header-content {
    position: relative;
    z-index: 2;
}


.home-header h1 {
  font-size: clamp(2.5em, 5vw, 3.8em); /* Responsive font size */
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.home-header .tagline {
  font-size: clamp(1.1em, 2.5vw, 1.4em);
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex; /* For icon alignment */
  align-items: center;
  justify-content: center;
  gap: 10px; /* Space between icon and text */
  padding: 15px 35px; /* Generous padding */
  border-radius: var(--border-radius-lg, 50px);
  text-decoration: none;
  font-size: clamp(1em, 2vw, 1.1em);
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
  box-shadow: var(--shadow-md, 0 0.5rem 1rem rgba(0, 0, 0, 0.15));
  cursor: pointer;
  border: 2px solid transparent; /* Base border */
}
.btn i {
    margin-right: 5px; /* Consistent icon spacing if not using gap */
}

.primary-btn {
  background-color: var(--accent-color, #28a745);
  color: var(--white-color, #fff);
}

.primary-btn:hover {
  background-color: var(--accent-darker-color, #218838);
  transform: translateY(-3px) scale(1.03);
  box-shadow: var(--shadow-lg, 0 1rem 3rem rgba(0, 0, 0, 0.175));
}

.secondary-btn {
  background-color: transparent;
  color: var(--white-color, #fff);
  border-color: var(--white-color, #fff);
}

.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--white-color, #fff);
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

/* --- Features Section --- */
.features-section {
  padding: 120px 20px 80px; /* Adjust padding to account for header overlap */
  background-color: var(--light-bg-color, #f8f9fa); /* Light background for contrast */
  flex-grow: 1;
  text-align: center; /* Center the section title */
}

.section-title {
  font-size: clamp(2em, 4vw, 2.8em);
  margin-bottom: 60px;
  color: var(--primary-darker-color, #0056b3);
  font-weight: 700;
  position: relative;
  display: inline-block; /* To make the pseudo-element work well */
}
.section-title span {
  position: relative;
  padding-bottom: 10px; /* Space for the underline */
}
.section-title span::after { /* Underline accent */
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 4px;
  background-color: var(--accent-color, #28a745);
  border-radius: 2px;
}


.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Min card width */
  gap: 35px; /* Increased gap */
  text-align: left; /* Reset text align for cards */
}

.feature-card {
  background-color: var(--white-color, #fff);
  padding: 35px 30px; /* Increased padding */
  border-radius: var(--border-radius-md, 0.5rem);
  border: 1px solid var(--border-color, #e0e0e0);
  box-shadow: var(--shadow-sm, 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075));
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center icon and title */
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg, 0 1rem 3rem rgba(0, 0, 0, 0.1));
  border-color: var(--primary-color, #007bff);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(0, 123, 255, 0.1); /* Light blue bg for icon */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  transition: background-color 0.3s ease;
}
.feature-card:hover .icon-wrapper {
    background-color: var(--primary-color, #007bff);
}
.feature-card:hover .icon-wrapper .icon {
    color: var(--white-color, #fff);
}

.feature-card .icon {
  font-size: 2.5em; /* Adjusted icon size */
  color: var(--primary-color, #007bff);
  transition: color 0.3s ease;
}

.feature-card h3 {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: var(--text-color-dark, #212529);
  font-weight: 600;
}

.feature-card p {
  font-size: 1em;
  color: var(--text-color-muted, #666);
  line-height: 1.7; /* Improved readability */
  flex-grow: 1; /* Allows paragraphs to take up space if cards have varying text length */
}

/* --- Footer --- */
.home-footer {
  background-color: var(--text-color-dark, #222);
  color: var(--text-color-light, #ccc);
  text-align: center;
  padding: 30px 0;
  font-size: 0.9em;
  margin-top: auto; /* Stick to bottom */
  border-top: 3px solid var(--primary-color, #007bff);
}

/* --- Responsive Design --- */
@media (max-width: 992px) { /* Tablet */
    .home-header {
        padding: 80px 0 70px;
        clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
        margin-bottom: -50px;
    }
    .features-section {
        padding-top: 100px;
    }
    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
    }
}

@media (max-width: 768px) { /* Mobile Landscape / Small Tablet */
  .home-header {
    padding: 60px 0 60px; /* Further reduce padding */
    clip-path: polygon(0 0, 100% 0, 100% 95%, 0 100%);
    margin-bottom: -30px;
  }
   .features-section {
        padding-top: 80px; /* Adjust for header */
        padding-bottom: 60px;
    }
  .home-header h1 {
    gap: 10px;
  }
  .cta-buttons {
    flex-direction: column; /* Stack buttons */
    align-items: center; /* Center stacked buttons */
    gap: 15px;
  }
  .btn {
    width: 80%; /* Make buttons wider */
    max-width: 320px; /* Max width for stacked buttons */
    padding: 12px 25px;
  }
  .features-grid {
    grid-template-columns: 1fr; /* Single column for feature cards */
    gap: 20px;
  }
  .feature-card {
    padding: 25px 20px;
  }
}

@media (max-width: 480px) { /* Mobile Portrait */
  .home-header {
    padding: 50px 0 50px;
    clip-path: polygon(0 0, 100% 0, 100% 97%, 0 100%);
    margin-bottom: -15px;
  }
  .features-section {
        padding-top: 60px;
        padding-bottom: 40px;
    }
  .btn {
    width: 90%;
  }
  .icon-wrapper {
    width: 70px;
    height: 70px;
    margin-bottom: 20px;
  }
  .feature-card .icon {
    font-size: 2em;
  }
  .feature-card h3 {
    font-size: 1.3em;
  }
  .feature-card p {
    font-size: 0.95em;
  }
}
</style>