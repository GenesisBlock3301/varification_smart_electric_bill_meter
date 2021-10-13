import React, {useState } from 'react'
import { Form, Button } from "react-bootstrap"
import axios from 'axios';



const Register = () => {
    const [register, setRegister] = useState({ reg: "" })
    const registerHandle = (e) => {
        console.log(e.target.value)
        setRegister({ [e.target.name]: e.target.value })
    }
    const registerOnSubmit = (e) => {
        e.preventDefault();
        const h_id = {
            reg: register.reg
        }
        axios.post("http://localhost:3000/hidregister", { h_id })
            .then(res => {
                console.log(res.data);
            })
    }
    return (
        <>
            <h1>Register</h1>
            <Form onSubmit={registerOnSubmit}>
                <Form.Group className="mb-3" controlId="hid">
                    <Form.Label>Register</Form.Label>
                    <Form.Control type="text" onChange={registerHandle} name="hid" placeholder="HID" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Register
                </Button>
            </Form>
        </>
    )
}
export default Register;