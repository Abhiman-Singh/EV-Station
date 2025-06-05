<template>
  <div class="auth-page">
    <div class="auth-container">
      <h2>{{ isLogin ? '🔐 Login' : '📝 Register' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="form-group password-group">
          <label for="password">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
          <span class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </span>
        </div>

        <button type="submit" class="submit-button">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>

      <p class="toggle-mode">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <a href="#" @click.prevent="toggleMode">
          {{ isLogin ? 'Register here' : 'Login here' }}
        </a>
      </p>

      <p v-if="error" class="error-message">⚠️ {{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AuthPage',
  data() {
    return {
      isLogin: true,
      username: '',
      password: '',
      error: null,
      showPassword: false
    };
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin;
      this.error = null;
      this.username = '';
      this.password = '';
    },
    async handleSubmit() {
      this.error = null;
      try {
        const url = this.isLogin
          ? `${process.env.VUE_APP_BACKEND_URL}/auth/login`
          : `${process.env.VUE_APP_BACKEND_URL}/auth/register`;

        const response = await axios.post(url, {
          username: this.username,
          password: this.password
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        this.$router.push('/chargers');
      } catch (err) {
        console.error('Auth error:', err);
        this.error = err.response?.data?.message || 'Something went wrong. Please try again.';
      }
    }
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
  padding: 20px;
}

.auth-container {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  transition: all 0.4s ease;
}

h2 {
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 2em;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
  position: relative;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  box-sizing: border-box;
  transition: 0.3s;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  outline: none;
}

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 38px;
  cursor: pointer;
  font-size: 1.2em;
  user-select: none;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.toggle-mode {
  margin-top: 20px;
  font-size: 0.95em;
  color: #555;
}

.toggle-mode a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

.toggle-mode a:hover {
  text-decoration: underline;
}

.error-message {
  color: #dc3545;
  margin-top: 20px;
  font-size: 0.9em;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-container {
    padding: 30px 20px;
  }

  h2 {
    font-size: 1.7em;
  }
}
</style>
