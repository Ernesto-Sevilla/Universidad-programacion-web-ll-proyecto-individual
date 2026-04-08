import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from " .. /components/login/FormularioLogin";
import { Container, Row, Col } from "react-bootstrap";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const navegar = useNavigate();

  const iniciarSesion = async () => {

    const usuarioValido = { email: "admin@correo.com", password: "123" };

    try {
      if (usuario === usuarioValido.email && contrasena === usuarioValido.password) {
        console.log("Sesión iniciada localmente");
        localStorage.setItem("usuario-supabase", usuario);
        navegar("/");
      } else {
        setError("Usuario o contraseña incorrectos (Modo Local)");
      }

      /*
      2. Lógica de Supabase (Comentada hasta que la DB esté lista)
        // recordar importar { supabase } al inicio del archivo he integrarlo dentro del proyecto con las credenciales .env
      
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

      };*/

    } catch (err) {
      setError("Error en el sistema de login");
      console.error(err);
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center">
        <Col>
          <h2><i className="bi-house-fill me-2"></i> Login</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;