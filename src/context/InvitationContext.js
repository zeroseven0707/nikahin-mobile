import React, { createContext, useState, useContext } from 'react';

const InvitationContext = createContext();

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within InvitationProvider');
  }
  return context;
};

export const InvitationProvider = ({ children }) => {
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    invitation,
    setInvitation,
    loading,
    setLoading,
    error,
    setError,
  };

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
};
