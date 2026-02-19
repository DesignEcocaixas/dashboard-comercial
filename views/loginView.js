function loginView(){
return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>Login</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-dark d-flex align-items-center justify-content-center vh-100">

<div class="card p-4 shadow" style="width:350px; background:#1e1e1e; color:white;">

    <h5 class="mb-3 text-center">Métricas Setor Comercial Eco</h5>

    <input class="form-control mb-3" id="token" placeholder="Digite seu token">

    <button class="btn btn-primary w-100" onclick="login()">Entrar</button>

</div>

<script>
function login(){
    fetch('/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token: token.value })
    }).then(res=>res.json())
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
