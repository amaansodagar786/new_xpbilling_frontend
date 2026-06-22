import React, { useState, useEffect } from "react";
import SmartRedirect from "./SmartRedirect";

const PermissionRoute = ({ children, requiredPermission }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUserPermissions(data.user?.permissions || []);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading permissions...</div>
      </div>
    );
  }

  // Admin can access everything
  if (userPermissions.includes("admin")) {
    return children;
  }

  // If requiredPermission is a string
  if (typeof requiredPermission === "string" && userPermissions.includes(requiredPermission)) {
    return children;
  }

  // If requiredPermission is an array (multiple options allowed)
  if (Array.isArray(requiredPermission) && requiredPermission.some(p => userPermissions.includes(p))) {
    return children;
  }

  // No access → redirect to SmartRedirect
  return <SmartRedirect />;
};

export default PermissionRoute;