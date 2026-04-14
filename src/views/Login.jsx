import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin.jsx";
import { Container, Row, Col } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig.js"

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const navegar = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario-supabase");
    if (usuarioGuardado) {
      navegar("/");
    }
  }, [navegar]);

  const iniciarSesion = async () => {    
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usuario,
          password: contrasena,
        });

        if (error) {
          setError("Usuario o contraseña incorrectos");
          return;

        }

        if (data.user) {
          localStorage.setItem("usuario-supabase", usuario);
          navegar("/");

        }
      } catch (err) {
        setError("Error al conectar con el servidor");
        console.error("Error en la solicitud:", err);

      }
  };

  return (
    <div className="contenedor-login">
      <FormularioLogin
        usuario={usuario}
        contrasena={contrasena}
        error={error}
        setUsuario={setUsuario}
        setContrasena={setContrasena}
        iniciarSesion={iniciarSesion}
      />
    </div>
  );
};

export default Login;