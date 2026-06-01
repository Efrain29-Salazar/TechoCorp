import React, { createContext, useContext, useState, useEffect } from 'react';

const ClienteContext = createContext(null);

export function ClienteProvider({ children }) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('clienteData');
    if (stored) {
      try { setCliente(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const loginCliente = (token, data) => {
    localStorage.setItem('clienteToken', token);
    localStorage.setItem('clienteData', JSON.stringify(data));
    setCliente(data);
  };

  const logoutCliente = () => {
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteData');
    setCliente(null);
  };

  return (
    <ClienteContext.Provider value={{ cliente, loading, loginCliente, logoutCliente }}>
      {children}
    </ClienteContext.Provider>
  );
}

export const useCliente = () => useContext(ClienteContext);
