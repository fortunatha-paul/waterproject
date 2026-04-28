import { useState } from 'react';
import './register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    nida: '',
    house_number: '',
    district: '',
    ward: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Registration failed' });
        }
      } else {
        setSuccessMessage('Registration successful! You can now log in.');
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          nida: '',
          house_number: '',
          district: '',
          ward: '',
          password: '',
          password_confirmation: '',
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          // window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Create Account</h1>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number *</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
            {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
          </div>

          {/* NIDA Field */}
          <div className="form-group">
            <label htmlFor="nida">NIDA *</label>
            <input
              type="text"
              id="nida"
              name="nida"
              value={formData.nida}
              onChange={handleChange}
              placeholder="Enter your NIDA number"
              required
            />
            {errors.nida && <span className="error-text">{errors.nida}</span>}
          </div>

          {/* House Number Field */}
          <div className="form-group">
            <label htmlFor="house_number">House Number *</label>
            <input
              type="text"
              id="house_number"
              name="house_number"
              value={formData.house_number}
              onChange={handleChange}
              placeholder="Enter your house number"
              required
            />
            {errors.house_number && <span className="error-text">{errors.house_number}</span>}
          </div>

         
          {/* District Field */}
          <div className="form-group">
            <label htmlFor="district">District *</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter your district"
              required
            />
            {errors.district && <span className="error-text">{errors.district}</span>}
          </div>

          {/* Ward Field */}
          <div className="form-group">
            <label htmlFor="ward">Ward *</label>
            <input
              type="text"
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              placeholder="Enter your ward"
              required
            />
            {errors.ward && <span className="error-text">{errors.ward}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password (min 8 characters)"
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm Password *</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}
