let mealsState = []
let user = {}
let ruta = 'login' //login, register,

const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s,'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHTML(`<li id="${item._id}"><h4>${item.name}</h4><p>${item.desc}</p></li>`)

    element.addEventListener('click', ()=>{
        const mealsList = document.getElementById('meal-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected');

        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value

        if (mealIdValue) {
            submit.removeAttribute('disabled')
        }
    })

    return element
}

const renderOrder = (order, meals) => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    console.log(meals)
    //const identifyUser = user.find(identifyUser => user._id === order.user_id)
console.log(user)
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li id="${order._id}"><h4>${meal.name}</h4><p>${order.user_id}</p></li>`)
    element.addEventListener('click', () =>{
        const orderId = document.getElementById(order._id)
        fetch('https://serverless-fedetorres21.vercel.app/api/orders/'+orderId.id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                authorization: token,
            },
        })
            .then(respuesta => {
            console.log(respuesta)
            /*if (respuesta.ok) {
                //renderOrder(respuesta, mealsState)
                renderOrders()
            }*/
            })

    })

    return element
}


const inicializaFormulario = () => {
    const orderForm = document.getElementById('order')

    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value

        if (!mealIdValue) {
            alert('Debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }

        const order = {
            meal_id: mealIdValue,
            user_id: user._id,
        }

        const token = localStorage.getItem('token')

        fetch('https://serverless-fedetorres21.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: token,
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
            .then(respuesta => {
                console.log(mealsState)

                const renderedOrder = renderOrder(respuesta, mealsState)
                const ordersList = document.getElementById('orders-list')
                ordersList.appendChild(renderedOrder)
                submit.removeAttribute('disabled')
                console.log(respuesta)
            })
            .catch(e => console.log(e))
    }
}

const inicializaDatos = () => {
    fetch('https://serverless-fedetorres21.vercel.app/api/meals')
        .then(response => response.json())
        .then(data => {
            //ESTO ES CREAR UNA VARIABLE GLOBAL CON EL DATA Y EN LA LINEA 1 EMPEZAMOS EL ARRAY VACIO
            mealsState = data
            const mealsList = document.getElementById('meal-list')
            const listItems = data.map(renderItem)
            mealsList.removeChild(mealsList.firstElementChild)
            listItems.forEach(element => mealsList.appendChild(element))

            //LLAMA EL LISTADO DE ORDENES DENTRO DEL LISTADO DE MEALS PARA PODER USAR LAS MEALS
            fetch('https://serverless-fedetorres21.vercel.app/api/orders')
                .then(response => response.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders-list')
                    const listOrders = ordersData.map(orderData => renderOrder(orderData, data))
                    ordersList.removeChild(ordersList.firstElementChild)
                    listOrders.forEach(element => ordersList.appendChild(element))
                })
        })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token) {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicializaDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-view')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (ev) => {
        ev.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        fetch('https://serverless-fedetorres21.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password})
        }).then(x => x.json())
            .then(respuesta => {
                localStorage.setItem('token', respuesta.token)
                //VARIABLE GLOBAL PARA COMPROBAR SI TIENE TOKEN Y RENDERIZAR EL LOGIN O LA APP
                ruta = 'orders'
                return respuesta.token
            })
            .then(token => {
                return fetch('https://serverless-fedetorres21.vercel.app/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: token,
                    },
                })
            })
            .then(x => x.json())
            .then(fetchedUser => {
                localStorage.setItem('user', JSON.stringify(fetchedUser))
                user = fetchedUser
                renderOrders()
            })

    }
}

window.onload = () => {
    renderApp()



}

