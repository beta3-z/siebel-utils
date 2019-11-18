define('siebel/custom/siebel-utils', function(){
    function app(){
        return SiebelApp.S_App;
    }

    function ps(some){
        if(typeof some === 'string')
            return stringToPs(some);
        else if(typeof some === 'object')
            return jsonToPs(some)

        return app().NewPropertySet();
    }

    function isPs(ps){
        return typeof ps === 'object'
            && typeof ps.GetChildCount === 'function'
    }

    function stringToPs(str){
        let result = ps();

        result.DecodeFromString(isPsString(str) ? str : jsonToPs(JSON.parse(str)));
        return result;
    }

    function isPsString(str){
        return typeof str === 'string' && str.match(/^@0([*`^~[])(0\1){3}/)
    }

    function psToJson(propertySet = ps()){
        const result = {};

        if(typeof propertySet === 'string'){
            propertySet = ps(propertySet);
        }

        if(isPs(propertySet)){
            result.__type = propertySet.GetType();
            result.__value = propertySet.GetValue();
            result.__children = psChildrenToJson(propertySet);

            result.__children.forEach( ( child ) => child.__type && ( result[child.__type] = child ) );

            for(let property = propertySet.GetFirstProperty(); !!property; property = propertySet.GetNextProperty()){
                result[property] = propertySet.GetProperty(property);
            }
        }

        return result;
    }

    function psChildrenToJson(ps){
        const children = [];
        const childCount = ps.GetChildCount();

        for(let i = 0; i < childCount;  ++i) {
            const child = ps.GetChild(i);

            children.push(psToJson(child));
        }

        return children;
    }

    function jsonToPs(json, type = '', value = ''){
        if(typeof json === 'string') json = JSON.parse(json);
        if(typeof json !== 'object' || json === null) return {};

        const result = ps();

        result.SetType(json.__type || type);
        result.SetValue(json.__value || value);

        if(Array.isArray(json)){
            json.map( child => jsonToPs(child) ).forEach( result.AddChild.bind(result) );
        } else {
            const props = Object.getOwnPropertyNames(json).filter(p => !p.match(/^__(type|value|children)/));

            for(let i = 0; i < props.length; ++i){
                const name = props[i];
                const value = json[name];

                if(
                    typeof value === 'string'
                    || typeof value === 'number'
                    || typeof value === 'undefined'
                    || typeof value === 'boolean'
                    || (typeof value !== 'object' && isNaN(value))
                    || value === null
                ){
                    result.SetProperty(name, typeof value === 'boolean' ? value ? 'Y' : 'N' : value || '' );
                } else {
                    result.AddChild(jsonToPs(value, name));
                }
            }
        }

        return result;
    }

    class Service {
        constructor(name){
            this.bs = app().GetService(name);
        }

        invoke(method, params = {}){
            const inputs = jsonToPs(params);
            const outputs = this.bs.InvokeMethod(method, inputs);

            const result = psToJson(outputs);

            return result['ResultSet'] || result;
        }
    }

    class Workflow {
        static service = new Service('Workflow Process Manager');

        constructor(name){
            this.name = name;
        }

        invoke(params){
            params['ProcessName'] = this.name;

            return Workflow.service.invoke('RunProcess', params);
        }
    }

    const helpers = {
        import(file){
            if(typeof file !== 'string') return;

            if(file.match(/\.css$/)){
                this.importCss(file);
            }
        },

        importCss(href){
            if(document.querySelectorAll(`head link[href="${href}"]`).length > 0) return;

            const link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = `${href}`;

            const head = document.getElementsByTagName('head')[0];

            head.appendChild(link);
        },

        service(name){
            return new Service(name);
        },

        workflow(name){
            return new Workflow(name);
        },

        invokeService(service, method, params = {}){
            return helpers.service(service).invoke(method, params);
        },

        invokeWorkflow(name, params = {}){
            return helpers.workflow(name).invoke(params);
        },

        invoke(...args){
            if(typeof args[1] === 'string')
                return helpers.invokeService(...args);
            else if(args.length > 0)
                return helpers.invokeWorkflow(...args);

            return {};
        },

        pa(name, value){
            if(typeof value !== 'undefined')
                return app().SetProfileAttr(name, value);

            return app().GetProfileAttr(name);
        },

        globalize(){
            Object.keys(helpers).forEach(prop => window[prop] = helpers[prop]);
        },

        psToJson,
        jsonToPs,
        app,
        ps,
    };

    return helpers;
})