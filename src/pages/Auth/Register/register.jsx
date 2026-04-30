import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../index.css';

export default function Register() {
  const navigate = useNavigate();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setSuccessMessage('Registration successful! Redirecting to login...');
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
        navigate('/login');
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
        <h1 style={{ color: 'black' }}>Create Account</h1>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-form-columns">
            {/* Left Column */}
            <div className="register-form-column">
              {/* Name Field */}
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={{ color: 'black' }}
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{ color: 'black' }}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Phone Number Field */}
              <div className="form-group">
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  style={{ color: 'black' }}
                  required
                />
                {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
              </div>

              {/* NIDA Field */}
              <div className="form-group">
                <input
                  type="text"
                  id="nida"
                  name="nida"
                  value={formData.nida}
                  onChange={handleChange}
                  placeholder="Enter your NIDA number"
                  style={{ color: 'black' }}
                  required
                />
                {errors.nida && <span className="error-text">{errors.nida}</span>}
              </div>

              {/* House Number Field */}
              <div className="form-group">
                <input
                  type="text"
                  id="house_number"
                  name="house_number"
                  value={formData.house_number}
                  onChange={handleChange}
                  placeholder="Enter your house number"
                  style={{ color: 'black' }}
                  required
                />
                {errors.house_number && <span className="error-text">{errors.house_number}</span>}
              </div>
            </div>

            {/* Right Column */}
            <div className="register-form-column">
              {/* District Field */}
              <div className="form-group">
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter your district"
                  style={{ color: 'black' }}
                  required
                />
                {errors.district && <span className="error-text">{errors.district}</span>}
              </div>

              {/* Ward Field */}
              <div className="form-group">
                <input
                  type="text"
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  placeholder="Enter your ward"
                  style={{ color: 'black' }}
                  required
                />
                {errors.ward && <span className="error-text">{errors.ward}</span>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password (min 8 characters)"
                    style={{ color: 'black', paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '12px'
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    style={{ color: 'black', paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '12px'
                    }}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{
              padding: '8px 70px',
              borderRadius: '9999px',
              backgroundColor: 'black !important',
              background: 'black !important',
              backgroundImage: 'none !important',
              backgroundLinearGradient: 'none !important',
              color: 'white',
              border: '1px solid black !important',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: 'auto',
              display: 'inline-block',
              boxShadow: 'none !important'
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          <p style={{ color: 'black' }}>Already have an account? <a href="/login">sigin in</a></p>
        </div>
      </div>
    </div>
  );
}
