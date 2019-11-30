(function() {
    if (typeof define === 'function') {
        define('siebel/custom/siebel-utils', utils);
    }

    function utils() {
        /**
         *
         * @returns {S_App}
         */
        function app() {
            return SiebelApp.S_App;
        }

        /**
         *
         * @param {string|object|} [some] - serialized property set string
         * @returns {JSSPropertySet}
         */
        function ps(some) {
            if (typeof some === 'string')
                return stringToPs(some);
            else if (typeof some === 'object')
                return jsonToPs(some);

            return app().NewPropertySet();
        }

        /**
         *
         * @param {string} str
         *
         * @returns {JSSPropertySet}
         */
        function stringToPs(str) {
            const result = ps();
            result.DecodeFromString(isPsString(str) ? str : jsonToPs(str));
            return result;
        }

        /**
         *
         * @param {string} str
         *
         * @returns {boolean}
         */
        function isPsString(str) {
            return typeof str === 'string' && !!str.match(/^@0([*`^~[])(0\1){3}/)
        }

        /**
         *
         * @param {JSSPropertySet} propertySet
         */
        function psToJson(propertySet) {
            const result = {};

            for (
                let propertyName = propertySet.GetFirstProperty();
                propertyName !== null;
                propertyName = propertySet.GetNextProperty()
            ) {
                result[propertyName] = propertySet.GetProperty(propertyName);
            }

            for (let i = 0; i < propertySet.GetChildCount(); ++i) {
                const child = propertySet.GetChild(i);
                const type = child.GetType();

                if (typeof result[type] === 'undefined') {
                    result[type] = [];
                }

                result[type].push(psToJson(child));
            }

            return result;
        }

        /**
         *
         * @param {string|object} json
         * @param {string} type
         *
         * @returns {JSSPropertySet}
         */
        function jsonToPs(json, type = '') {
            if (typeof json === 'string') json = JSON.parse(json);
            if (typeof json !== 'object' || json === null) return ps();

            const result = ps();

            result.SetType(type);

            if (Array.isArray(json)) {
                json
                    .map(child => jsonToPs(child))
                    .forEach(result.AddChild.bind(result));
            } else {
                Object
                    .keys(json)
                    .forEach(name => {
                        const value = json[name];

                        if (typeof value === 'object' && !!value) {
                            result.AddChild(jsonToPs(value, name));
                        } else if (typeof value === 'boolean') {
                            result.SetProperty(name, value ? 'Y' : 'N');
                        } else {
                            result.SetProperty(name, value);
                        }
                    })
            }

            return result;
        }

        class Service {
            constructor(name) {
                this.bs = app().GetService(name);
            }

            invoke(method, params = {}) {
                const inputs = jsonToPs(params);
                const outputs = this.bs.InvokeMethod(method, inputs);

                const result = psToJson(outputs);

                return result['ResultSet'] || result;
            }
        }

        class Workflow {
            static service = new Service('Workflow Process Manager');

            constructor(name) {
                this.name = name;
            }

            invoke(params) {
                params['ProcessName'] = this.name;

                return Workflow.service.invoke('RunProcess', params);
            }
        }

        const helpers = {
            /**
             *
             * @param {string} file
             */
            import(file) {
                if (typeof file !== 'string') return;

                if (file.match(/\.css$/)) {
                    this.importCss(file);
                }
            },

            /**
             *
             * @param {string} href
             */
            importCss(href) {
                if (document.querySelectorAll(`head link[href="${href}"]`).length > 0) return;

                const link = document.createElement('link');

                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = `${href}`;

                const head = document.getElementsByTagName('head')[0];

                head.appendChild(link);
            },

            /**
             *
             * @param {string} name
             *
             * @returns {Service}
             */
            service(name) {
                return new Service(name);
            },

            /**
             *
             * @param {string} name
             *
             * @returns {Workflow}
             */
            workflow(name) {
                return new Workflow(name);
            },

            /**
             *
             * @param {string} name
             * @param {string} method
             * @param {object} [inputs]
             *
             * @returns {*}
             */
            invokeService(name, method, inputs = {}) {
                return helpers.service(name).invoke(method, inputs);
            },

            /**
             *
             * @param {string} name
             * @param {object} [inputs]
             *
             * @returns {*}
             */
            invokeWorkflow(name, inputs = {}) {
                return helpers.workflow(name).invoke(inputs);
            },

            /**
             *
             * @param {string} workflowOrServiceName
             * @param {string|object} [methodNameOrWorkflowInputs]
             * @param {object} [serviceInputs]
             * @returns {{}|*}
             */
            invoke(workflowOrServiceName, methodNameOrWorkflowInputs, serviceInputs) {
                if (typeof methodNameOrWorkflowInputs === 'string')
                    return helpers.invokeService(workflowOrServiceName, methodNameOrWorkflowInputs, serviceInputs);
                else if (typeof workflowOrServiceName === 'string')
                    return helpers.invokeWorkflow(workflowOrServiceName, methodNameOrWorkflowInputs);

                return {};
            },

            /**
             *
             * @param {string} name
             * @param {string} [value]
             * @returns {string|boolean}
             */
            pa(name, value) {
                if (typeof value !== 'undefined')
                    return app().SetProfileAttr(name, value);

                return app().GetProfileAttr(name);
            },

            globalize() {
                Object.keys(helpers).forEach(prop => window[prop] = helpers[prop]);
            },

            psToJson,
            jsonToPs,
            app,
            ps,
        };

        return helpers;
    }

    if(typeof module !== 'undefined') {
        const createPropSet = require('../lib/jsPropset');

        var SiebelApp = {
            S_App: {
                GetService() {
                    const service = () => {};

                    service.invokeMethod = () => {};

                    return service;
                },

                NewPropertySet() {
                    return createPropSet()
                }
            }
        };

        module.exports = utils()
    }
})();
