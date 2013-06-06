$(document).ready(function() {
	$('.boton-lupa').click(function() {
		var textoABuscar = $(this).parent().children().eq(0).val();

		redireccionBusqueda(textoABuscar);
	});

	$('.boton-buscar').click(function() {
		var textoABuscar = $(this).parent().children().eq(0).val();

		redireccionBusqueda(textoABuscar);
	});

	$('.search-input').keypress(function(e) {
		if (e.which == 13) {
			redireccionBusqueda($(this).val());
		}
	});

	$('.boton-home').click(function() {
		var id = $(this).data('id');
		localStorage.setItem("apartado-abierto", id);
		window.location = "ficha.html";
	});
	
	$('a[href*="#externo"]').click(function(event) {
		event.preventDefault();
		var ruta = $(this).attr('href') + "";
		ruta = ruta.split('-');
        console.log(ruta[1]);
		window.open(ruta[1], '_system');
	});
    
	function redireccionBusqueda(texto) {
		if (texto != "") {
			localStorage.setItem("texto-busqueda", texto);
			window.location = "busqueda.html";
		}
	}
});

//Retorna true o false si hay internet.
function comprobarConexion() {
	return navigator.onLine; 
}

//Retorna true o false si hay soporte para local storage (validacion para navegadores viejos)
function comprobarSoporte() {
	if (localStorage)
		return true;
	else
		return false;
}

//Funcion para eliminar el local storage
function eliminarLibro() {
	for (i = 0; i <= localStorage.length - 1; i++) {
		var key = localStorage.key(i);
		if ((key != "texto-busqueda") && (key != "version") && (key != "apartado-abierto") && (key != "ultimaActualizacion") && (key != "apartado-abierto-busqueda") && (key != "autenticado")) {
			localStorage.setItem(key, "");
		}
	}
}

//Ajax para descargar el libro desde el servicio web.
function descargarLibro() {
	var parametros = {
		"accion": "descargar-libro"
	};

	$.ajax({
		data: parametros,
		url: 'http://tysabri.medericediciones.com/backend/modules/conexion/web_service.php',
		type: 'post',
		dataType: 'jsonp',
		beforeSend: function() {
			$('#wrapper').css("display", "none");
			$('#cargando').css("display", "block");
		},
		success: function(response) {
			guardarLibro(response);
			//guardo la fecha de la ultima actualizacion.
			localStorage.setItem("ultimaActualizacion", new Date());
			$('#wrapper').css("display", "block");
			$('#cargando').css("display", "none");
		},
		error: function(request, error) {
			if (error == "timeout") {
				alert('error de tiempo de espera');
			}
			else {
				alert('error : error conectando al servidor');
			}
		}
	});
}

//Funcion para desparsear la respuesta del ajax, y guardarlo en el local storage
function guardarLibro(response) {
	var versionActual = localStorage.getItem("version");
	if (versionActual < response.version) {
		eliminarLibro();
		localStorage.setItem("version", response.version);
		$.each(response.resultado, function(i, seccion) {
			var texto = {
				"titulo": seccion.titulo,
				"contenido": seccion.contenido
			};
			localStorage.setItem(seccion.id, JSON.stringify(texto));
		});
	}
}

//Metodo para obtener una seccion completa.
function getSeccion(seccion) {
	var texto = JSON.parse(localStorage.getItem(seccion));
	return texto;
}

/*function buscarTexto(texto) {
	var ArrayBusquedas = new Array();
	for (i = 0; i <= localStorage.length - 1; i++) {
		var key = localStorage.key(i);
   	//para que no confunda los otros elementos que estan en el local Storage
		if ((key != "texto-busqueda") && (key != "version") && (key != "apartado-abierto") && (key != "ultimaActualizacion") && (key != "autenticado") && (key != "apartado-abierto-busqueda")) {
			var val = JSON.parse(localStorage.getItem(key));
			$("#busqueda-temporal").html(val.contenido);
            // var resultados = $("#busqueda-temporal:contains('"+texto+"')");
			var resultados = $("#busqueda-temporal").children().filter(':containsCI(' + texto + ')');
			$.each(resultados, function(index, value) {
				var elemento = {
					"id": key,
					"titulo": val.titulo,
					"contenido": value
				}

				ArrayBusquedas.push(elemento);
				$("#busqueda-temporal").html('');
			});
		}
	}

	llenarBusquedas(ArrayBusquedas);
}*/

function findString (str) {
  strFound=self.find(str);
  if (!strFound) {
   strFound=self.find(str,0,1);
   while (self.find(str,0,1)) continue;
  }
 }

function buscarTexto(texto) {
	var ArrayBusquedas = new Array();
    var Apartados=new Array("1","2","3","4.1","4.2","4.3","4.4","4.5","4.6","4.7","4.8","4.9","5.1","5.2","5.3","6.1","6.2","6.3","6.4","6.5","6.6","7","8","9");
	for (i = 0; i < Apartados.length-1; i++) {
 
			var val = JSON.parse(localStorage.getItem(Apartados[i]));
			$("#busqueda-temporal").html(val.contenido);
            //var resultados = $("#busqueda-temporal:contains('"+texto+"')");
        console.log(resultados);
			var resultados = $("#busqueda-temporal").children().filter(':containsCI(' + texto + ')');
			$.each(resultados, function(index, value) {
				var elemento = {
					"id":Apartados[i],
					"titulo": val.titulo,
					"contenido": value
				}

				ArrayBusquedas.push(elemento);
				$("#busqueda-temporal").html('');
			});
	}

	llenarBusquedas(ArrayBusquedas);
}

function llenarBusquedas(ArrayBusquedas) {
	$('#resultado-busqueda').html("");
	if (ArrayBusquedas.length > 0) {
		$.each(ArrayBusquedas, function(index, value) {
			d = document.createElement('div');
			$(d).addClass("busqueda-item");
			$(d).append('<span class="resultado-titulo">' + value.id + '. ' + value.titulo + '</span><br /><br />');
			$(d).append(value.contenido);
			link = value.id + "";
			link = link.replace(".", "-");
			$(d).append('...<a class="resultado-titulo" href="#ficha" data-seccion="' + link + '">leer más</a>');
			$(d).appendTo($("#resultado-busqueda"));
		});
		resaltar();
	}
	else {
		d = document.createElement('div');
		$(d).append('<h2>No se encontraron resultados!.</h2>');
		$(d).appendTo($("#resultado-busqueda"));
	}
}

jQuery.extend(
	jQuery.expr[':'].containsCI = function(a, i, m) {
		//-- faster than jQuery(a).text()
		var sText = (a.textContent || a.innerText || "");
		var zRegExp = new RegExp(m[3], 'i');
		return zRegExp.test(sText);
	}
	);

//Metodo para verificar si debe ser actualizada la informacion o no.

function debeActualizar() {
	if (localStorage.length == 0) {
		return true;
	}
	var fechaUltima = new Date(localStorage.getItem("ultimaActualizacion"));
	var fechaHoy = new Date();
	var t2 = fechaHoy;
	var t1 = fechaUltima;
	var diasTranscurridos = parseInt((t2 - t1) / (24 * 3600 * 1000));
    
	if (diasTranscurridos > 1) {
		return true;
	}
	else {
		return false;
	}
}

function resaltar() {
	$('#resultado-busqueda').highlight($.trim($('.search-input').val()), false);
}
//Esta funcion llenara todo el contenido de cada seccion con lo que deba llevar.
function cargarContenido(abrir) {
	var footer = '<br /><span class="footer-lista-elemento"></span>';
	$('a[href="#1"]').html('<div class="texto-titulo-lista">' + '1. ' + getSeccion('1').titulo + '</div><span class="flechas">');
	$('a[href="#1"]').parent().children().eq(1).html(getSeccion('1').contenido);
	$(footer).appendTo($('a[href="#1"]').next())

	$('a[href="#2"]').html('<div class="texto-titulo-lista">' + '2. ' + getSeccion('2').titulo + '</div><span class="flechas"> ');
	$('a[href="#2"]').parent().children().eq(1).html(getSeccion('2').contenido + footer);

	$('a[href="#3"]').html('<div class="texto-titulo-lista">' + '3. ' + getSeccion('3').titulo + '</div><span class="flechas"> ');
	$('a[href="#3"]').parent().children().eq(1).html(getSeccion('3').contenido + footer);

	$('a[href="#4-1"]').html('<div class="texto-titulo-lista">' + '4.1 ' + getSeccion('4.1').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-1"]').parent().children().eq(1).html(getSeccion('4.1').contenido + footer);

	$('a[href="#4-2"]').html('<div class="texto-titulo-lista">' + '4.2 ' + getSeccion('4.2').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-2"]').parent().children().eq(1).html(getSeccion('4.2').contenido + footer);

	$('a[href="#4-4"]').html('<div class="texto-titulo-lista">' + '4.4 ' + getSeccion('4.4').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-4"]').next().html(getSeccion('4.4').contenido + footer);

	$('a[href="#4-5"]').html('<div class="texto-titulo-lista">' + '4.5 ' + getSeccion('4.5').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-5"]').next().html(getSeccion('4.5').contenido + footer);

	$('a[href="#4-6"]').html('<div class="texto-titulo-lista">' + '4.6 ' + getSeccion('4.6').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-6"]').next().html(getSeccion('4.6').contenido + footer);

	$('a[href="#4-7"]').html('<div class="texto-titulo-lista">' + '4.7. ' + getSeccion('4.7').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-7"]').next().html(getSeccion('4.7').contenido + footer);

	$('a[href="#4-8"]').html('<div class="texto-titulo-lista">' + '4.8 ' + getSeccion('4.8').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-8"]').next().html(getSeccion('4.8').contenido + footer);

	$('a[href="#4-9"]').html('<div class="texto-titulo-lista">' + '4.9 ' + getSeccion('4.9').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-9"]').next().html(getSeccion('4.9').contenido + footer);

	$('a[href="#5-1"]').html('<div class="texto-titulo-lista">' + '5.1 ' + getSeccion('5.1').titulo + '</div><span class="flechas"> ');
	$('a[href="#5-1"]').parent().children().eq(1).html(getSeccion('5.1').contenido + footer);

	$('a[href="#5-2"]').html('<div class="texto-titulo-lista">' + '5.2 ' + getSeccion('5.2').titulo + '</div><span class="flechas"> ');
	$('a[href="#5-2"]').next().html(getSeccion('5.2').contenido + footer);

	$('a[href="#5-3"]').html('<div class="texto-titulo-lista">' + '5.3 ' + getSeccion('5.3').titulo + '</div><span class="flechas"> ');
	$('a[href="#5-3"]').next().html(getSeccion('5.3').contenido + footer);

	$('a[href="#6-1"]').html('<div class="texto-titulo-lista">' + '6.1 ' + getSeccion('6.1').titulo + '</div><span class="flechas"> ');
	$('a[href="#6-1"]').parent().children().eq(1).html(getSeccion('6.1').contenido + footer);

	$('a[href="#6-2"]').html('<div class="texto-titulo-lista">' + '6.2 ' + getSeccion('6.2').titulo + '</div><span class="flechas"> ');
	$('a[href="#6-2"]').parent().children().eq(1).html(getSeccion('6.2').contenido + footer);

	$('a[href="#6-3"]').html('<div class="texto-titulo-lista">' + '6.3 ' + getSeccion('6.3').titulo + '</div><span class="flechas"> ');
	$('a[href="#6-3"]').parent().children().eq(1).html(getSeccion('6.3').contenido + footer);

	$('a[href="#6-4"]').html('<div class="texto-titulo-lista">' + '6.4 ' + getSeccion('6.4').titulo + '</div><span class="flechas"> ');
	$('a[href="#6-4"]').parent().children().eq(1).html(getSeccion('6.4').contenido + footer);

	$('a[href="#6-5"]').html('<div class="texto-titulo-lista">' + '6.5 ' + getSeccion('6.5').titulo + '</div><span class="flechas"> ');
	$('a[href="#6-5"]').parent().children().eq(1).html(getSeccion('6.5').contenido + footer);

	$('a[href="#6-6"]').html('<div class="texto-titulo-lista">' + '6.6 ' + getSeccion('6.6').titulo + '</div><span class="flechas"> ');
	$('a[href="#6-6"]').next().html(getSeccion('6.6').contenido + footer);

	$('a[href="#7"]').html('<div class="texto-titulo-lista">' + '7. ' + getSeccion('7').titulo + '</div><span class="flechas"> ');
	$('a[href="#7"]').parent().children().eq(1).html(getSeccion('7').contenido + footer);

	$('a[href="#8"]').html('<div class="texto-titulo-lista">' + '8. ' + getSeccion('8').titulo + '</div><span class="flechas"> ');
	$('a[href="#8"]').parent().children().eq(1).html(getSeccion('8').contenido + footer);

	$('a[href="#9"]').html('<div class="texto-titulo-lista">' + '9. ' + getSeccion('9').titulo + '</div><span class="flechas"> ');
	$('a[href="#9"]').parent().children().eq(1).html(getSeccion('9').contenido + footer);

	$('a[href="#10"]').html('<div class="texto-titulo-lista">' + '10. ' + getSeccion('10').titulo + '</div><span class="flechas"> ');
	$('a[href="#10"]').parent().children().eq(1).html(getSeccion('10').contenido + footer);

	$('a[href="#4-3"]').html('<div class="texto-titulo-lista">' + '4.3 ' + getSeccion('4.3').titulo + '</div><span class="flechas"> ');
	$('a[href="#4-3"]').next().html(getSeccion('4.3').contenido + footer);

	$('ul.accordion').accordion();
	if (abrir != "") {
		var apartadoAbierto = abrir;
		$('a[href=#' + apartadoAbierto + ']').click();
		setTimeout(function() {
			$("body,html,document").animate({scrollTop: $('a[href=#' + apartadoAbierto + ']').offset().top}, 500);
		}, 500);
		localStorage.setItem('apartado-abierto', "");
	}
	else {
		apartadoAbierto = localStorage.getItem('apartado-abierto-busqueda') + "";
		var click = apartadoAbierto.split('-');
		if (click.length == 2) {
			$('a[href=#' + click[0] + ']').click();
			$('a[href=#' + click[0] + '-' + click[1] + ']').click();
			setTimeout(function() {
				console.log('a[href=#' + click[0] + '-' + click[1] + ']');
				$("body,html,document").animate({scrollTop: $('a[href=#' + click[0] + '-' + click[1] + ']').offset().top}, 500);
			}, 500);
		}
		else {
			$('a[href=#' + click[0] + ']').click();
			setTimeout(function() {
				console.log('a[href=#' + click[0] + '-' + click[1] + ']');
				$("body,html,document").animate({scrollTop: $('a[href=#' + click[0] + ']').offset().top}, 500);
			}, 500);  
		}
    
		localStorage.setItem('apartado-abierto-busqueda', "");    
	}
 
	$('a[href*="#link"]').click(function() {
		contenedor = $(this).closest('li');

		var linkid = $(this).attr('href') + "";
		var id = linkid.split('_');

		var subapartado = id[1] + "";
		subapartado = subapartado.split("-");
		//Esto es para el caso que el link sea una seccion con otra seccion dentro, ejemplo 6-6, haria falta hacer
		//2 clicks,uno en la seccion 6 y luego otro en el 6-6, para poder activar el nodo correctamente.
		if (subapartado.length == 2) {
			//esta validacion es para el caso cuando el hipervinculo me lleve a otro que este en ese mismo subapartado, por lo que no necesito hacer 2 clicks.
			var hrefContenedor = $(contenedor).children().eq(0).attr("href") + "";
			var subapartadoContenedor = hrefContenedor.split("-");
			subapartadoContenedor = subapartadoContenedor[0] + "";
			subapartadoContenedor = subapartadoContenedor.substring(1, 2);
			var debeCerrar = false;

			if (subapartadoContenedor != subapartado[0]) {
				debeCerrar = true;
			}

			if (debeCerrar) {
				$(contenedor).children().eq(0).click();
				$('a[href=#' + subapartado[0] + ']').click();
				console.log("debe cerrar");
			}

			$('a[href=#' + id[1] + ']').click();
		}
		else {
			$(contenedor).children().eq(0).click();
			$('a[href=#' + id[1] + ']').click();
		}
        
		setTimeout(function() {
			$("body,html,document").animate({scrollTop: $('a[href=#' + id[1] + ']').offset().top}, 500);
		}, 500);
	});
 
	return true;
}