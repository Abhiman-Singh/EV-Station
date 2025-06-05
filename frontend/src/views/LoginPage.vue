<template>
  <div class="auth-container">
    <h2>🔐 Login to Continue</h2>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required placeholder="Enter your username" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required placeholder="Enter your password" />
      </div>
      <button type="submit" :disabled="!username || !password">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
    </form>

    <p v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </p>

    <div v-if="isLoggedIn" class="already-logged-in-message">
      <p>You are already logged in.</p>
      <router-link to="/chargers" class="view-chargers-link">
        🚗 View Charging Stations
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      error: null,
      isLoggedIn: false
    };
  },
  mounted() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('token');
    },
    async login() {
      this.error = null;
      try {
        const response = await axios.post(`${process.env.VUE_APP_BACKEND_URL}/auth/login`, {
          username: this.username,
          password: this.password
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          username: response.data.username
        }));

        this.$router.push('/chargers');
      } catch (err) {
        console.error('Login error:', err);
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 420px;
  margin: 60px auto;
  padding: 40px 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  color: #34495e;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  outline: none;
}

button {
  background-color: #007bff;
  color: #fff;
  padding: 14px;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

button:disabled {
  background-color: #b0d4ff;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 20px;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.already-logged-in-message {
  margin-top: 30px;
  background-color: #e9f7ef;
  border: 1px solid #d4edda;
  border-radius: 6px;
  padding: 15px;
  color: #155724;
}

.view-chargers-link {
  margin-top: 10px;
  display: inline-block;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 5px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.view-chargers-link:hover {
  background-color: #218838;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-container {
    margin: 30px 20px;
    padding: 30px 20px;
  }

  h2 {
    font-size: 1.7em;
  }
}
</style>
