import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signUpRequest, clearError } from '../../store/slices/authSlice';
import { UserRole } from '../../types/user';

export function AuthTest() {
  const dispatch = useAppDispatch();
  const { isLoading, error, user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleTestSignUp = () => {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeToTerms: true,
      role: UserRole.USER
    };

    dispatch(signUpRequest(testData));
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Redux Auth Test</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.name : 'None'}</p>
        {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
      </div>

      <div className="space-x-2">
        <button 
          onClick={handleTestSignUp}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Sign Up'}
        </button>
        
        <button 
          onClick={() => dispatch(clearError())}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear Error
        </button>
      </div>
    </div>
  );
}





