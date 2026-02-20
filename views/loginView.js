function loginView(){
return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login - Sistema de Metas</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<style>

/* ========================= */
/* LOGIN DARK PREMIUM */
/* ========================= */

body{
    background: radial-gradient(circle at top left, #1a1a1a, #0f0f0f);
    color: white;
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
}

/* Container central */
.login-wrapper{
    width:100%;
    max-width:900px;
}

.login-box{
    background:#1e1e1e;
    border-radius:16px;
    box-shadow:0 0 50px rgba(0,0,0,0.6);
    overflow:hidden;
}

/* Lado esquerdo */
.login-left{
    padding:50px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    background:#181818;
}

.login-left h1{
    font-weight:700;
    font-size:26px;
}

.login-left p{
    opacity:0.8;
    margin-top:15px;
    font-size:14px;
}

/* Lado direito */
.login-right{
    padding:50px;
    display:flex;
    flex-direction:column;
    justify-content:center;
}

/* Logo corrigida */
.login-right img{
    height:60px;
    width:auto;
    object-fit:contain;
}

/* Inputs */
.form-control{
    background:#2a2a2a;
    border:1px solid #3a3a3a;
    color:white;
    height:45px;
}

.form-control::placeholder{
    color:#bbbbbb;
    opacity:1;
}

.form-control:focus{
    background:#2a2a2a;
    color:white;
    border-color:#0d6efd;
    box-shadow:none;
}

.btn-primary{
    height:45px;
    font-weight:600;
}

/* ========================= */
/* MOBILE AJUSTADO */
/* ========================= */

@media(max-width:768px){

    body{
        align-items:flex-start;
        padding-top:40px;
    }

    .login-box{
        border-radius:12px;
    }

    .login-left{
        display:none;
    }

    .login-right{
        padding:35px 25px;
    }

    .login-right img{
        height:50px;
    }
}

</style>

</head>

<body>

<div class="login-wrapper">
    <div class="row login-box g-0">

        <!-- LADO ESQUERDO -->
        <div class="col-md-6 login-left">

            <h1>Métricas Setor Comercial</h1>

            <p>
                Plataforma interna para controle de metas,
                desempenho comercial e indicadores estratégicos.
            </p>

            <p>
                Acompanhe vendas, clientes, fechamentos
                e visitas com análise consolidada em tempo real.
            </p>

            <div class="mt-4 text-secondary">
                <i class="fa-solid fa-chart-line me-3"></i>
                <i class="fa-solid fa-bullseye me-3"></i>
                <i class="fa-solid fa-users"></i>
            </div>

        </div>

        <!-- LADO DIREITO -->
        <div class="col-md-6 login-right text-center">

            <img src="/logo.png" class="mb-4">

            <h5 class="fw-bold mb-4">Acesso ao Sistema</h5>

            <input 
                class="form-control mb-3" 
                id="token" 
                placeholder="Digite seu token de acesso"
            >

            <button 
                class="btn btn-primary w-100"
                onclick="login()">
                <i class="fa-solid fa-right-to-bracket me-2"></i>
                Entrar
            </button>

            <div class="mt-4 small text-secondary">
                Acesso exclusivo para colaboradores autorizados
            </div>

        </div>

    </div>
</div>

<script>
function login(){
    fetch('/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token: token.value })
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.sucesso){
            window.location.href = '/';
        }else{
            alert('Token inválido');
        }
    });
}
</script>

</body>
</html>
`;
}

module.exports = loginView;