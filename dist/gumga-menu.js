(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function () {
	'use strict';

	Menu.$inject = ['$http', '$compile'];
	function Menu($http, $compile) {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			link: function link(scope, el, attrs) {
				scope.v = [];
				var indexs = [];
				var count = 0;

				var menuOpen = false;

				var keyIsValid = function keyIsValid(key) {
					return scope.keys.indexOf(key) != -1;
				};

				$http.get(attrs.menuUrl).then(function (data) {
					scope.dados = data.data;
				}, function (data) {
					throw 'Erro:' + data;
				});

				$http.get(attrs.keysUrl).then(function (data) {
					scope.keys = data.data;
				}, function (data) {
					throw 'Erro:' + data;
				});

				scope.$watchGroup(['dados', 'keys'], function () {
					if (scope.dados && scope.keys) {
						gerateMenus();
					}
				});

				var gerateMenus = function gerateMenus() {
					var template = ['<div>'];
					template.push('<button id="btn-menu" class="btn btn-link" ng-click="mostrarMenu()"><i class="glyphicon glyphicon-align-justify"></i></button>');
					template.push('<nav id="menu" class="col-sm-3" name="menu">');
					template.push('<ul class="menu-holder">');
					template.push('<img ng-src="' + attrs.image + '" alt="logo" width="40%" class="img-centered">');
					for (var i = 0; i < scope.dados.length; i++) {
						if (keyIsValid(scope.dados[i].key)) {
							template.push(gerarNavPill(scope.dados[i], 'menu', { count: -1, label: null }));
						}
					}
					template.push('</ul>');
					template.push('</nav>');
					template.push('</div>');
					template = template.join('\n');
					el.append($compile(template)(scope));
				};

				var gerarNavPill = function gerarNavPill(param, type, parent) {
					scope.v[count] = {
						isActive: false,
						parent: parent.count
					};

					var urlSelected = location.hash;
					if (param.URL) {
						var url = angular.copy(param.URL) || ' ';
						url = '#/' + url.replace('.', '/');
					}

					if (urlSelected == url) {
						var template = ['<li class="' + type + '-option active" >'];
					} else {
						var template = ['<li class="' + type + '-option">'];
					}

					if (param.filhos.length > 0 && verificarPermicaoFilho(param.filhos)) {
						template.push('<i  ng-class="v[' + count + '].isActive ? \' glyphicon glyphicon-chevron-down \' : \'glyphicon glyphicon-chevron-right\'" class="fa ' + type + '-color"  ng-click="resetarMenu(' + count + ')"></i>');
					} else {
						if (param.icon) {
							if (param.icon_color) {
								template.push('<i  class=" ' + param.icon + ' " style="color: ' + param.icon_color + '" ng-click="resetarMenu(' + count + ')"></i>');
							} else {
								template.push('<i  class=" ' + param.icon + ' " style="icon white" ng-click="resetarMenu(' + count + ')"></i>');
							}
						}
					}

					template.push('<a ' + (param.URL ? 'ui-sref="' + param.URL + '"' : ' ') + ' ng-class="v[' + count + '].isActive ? \'is-active\' : \' \'" ');

					if (parent.label === null || param.filhos.length > 0) {
						template.push('gumga-translate-tag="' + param.label.toLowerCase() + '.menuLabel">');
					} else if (param.filhos.length === 0) {
						template.push('gumga-translate-tag="' + parent.label.toLowerCase() + '.' + param.label.toLowerCase() + '">');
					}
					if (type == 'submenu') {
						template.push('gumga-translate-tag="' + param.label.toLowerCase() + '.menuLabel">');
					}
					template.push('</a>');

					if (param.imageUrl) {
						if (param.imageWidth && param.imageHeight) {
							template.push('<a ui-sref="' + param.URL + '"><img  src="' + param.imageUrl + '" style="width: ' + param.imageWidth + '; height: ' + param.imageHeight + ';" ng-click="resetarMenu(' + count + ')"></i></a>');
						} else template.push('<a ui-sref="' + param.URL + '"><img class="image-size-default" src="' + param.imageUrl + '" ng-click="resetarMenu(' + count + ')"></i></a>');
					}

					var aux = count;

					count++;
					if (param.filhos.length > 0) {
						template.push('<ul ng-class="v[' + (count - 1) + '].isActive ? \' submenu-group-ativo\' : \'submenu-group\'" class="menu-holder">');
						for (var i = 0; i < param.filhos.length; i++) {
							if (keyIsValid(param.filhos[i].key)) {
								template.push(gerarNavPill(param.filhos[i], 'submenu', { count: aux, label: param.label }));
							}
						}
						template.push('</ul>');
					}
					template.push('</li>');
					return template.join('\n');
				};

				scope.resetarMenu = function (index) {
					var i;
					if (scope.v[index].isActive) {
						for (i = 0; i < scope.v.length; i++) {
							scope.v[index].isActive = false;
						}
						setarTrue(scope.v[index].parent);
					} else {
						for (i = 0; i < scope.v.length; i++) {
							scope.v[i].isActive = false;
						}
						setarTrue(index);
					}
				};

				function setarTrue(index) {
					if (index >= 0) {
						scope.v[index].isActive = true;
						setarTrue(scope.v[index].parent);
					}
				}

				scope.mostrarMenu = function () {
					menuOpen = !menuOpen;

					var elm = el.find('nav');
					if (menuOpen) {
						elm.addClass('open-menu');
					} else {
						elm.removeClass('open-menu');
					}
				};

				function verificarPermicaoFilho(filhos) {
					for (var i = 0; i < filhos.length; i++) {
						for (var j = 0; j < scope.keys.length; j++) {
							if (filhos[i].key == scope.keys[j]) {
								return true;
							}
						}
					}
					return false;
				}
			}
		};
	}

	angular.module('gumga.menu', []).directive('gumgaMenu', Menu);
})();

},{}]},{},[1]);
