"use strict";

/**
 * @brief generates polyhedral dice with roll animation and result calculation
 * @author Sarah Rosanna Busch (derived from the work of Anton Natarov)
 * @date 2 Aug 2022
 * @dependencies teal.js, cannon.js, three.js
 */

const DICE = (function() {
    var that = {};

    var vars = { //todo: make these configurable on init
        frame_rate: 1 / 60,
        scale: 100, //dice size        
        material_options: {
            specular: 0x172022,
            color: 0xf0f0f0,
            shininess: 40,
            shading: THREE.FlatShading,
        },
        label_color: '#aaaaaa', //numbers on dice
        dice_color: '#202020',
        ambient_light_color: 0xf0f0f0,
        spot_light_color: 0xefefef,
        desk_color: '#101010', //canvas background
        desk_opacity: 0.5,
        use_shadows: true,
        use_adapvite_timestep: true, //todo: setting this to false improves performace a lot. but the dice rolls don't look as natural...
        diceToRoll: "1d4+1d6+1d8"
    }

    const CONSTS = {
        known_types: ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'],
        dice_face_range: { 'd4': [1, 4], 'd6': [1, 6], 'd8': [1, 8], 'd10': [0, 9],
            'd12': [1, 12], 'd20': [1, 20], 'd100': [0, 9] },
        dice_mass: { 'd4': 300, 'd6': 300, 'd8': 340, 'd10': 350, 'd12': 350, 'd20': 400, 'd100': 350 },
        dice_inertia: { 'd4': 5, 'd6': 13, 'd8': 10, 'd10': 9, 'd12': 8, 'd20': 6, 'd100': 9 },
        
        standart_d20_dice_face_labels: [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
                '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        standart_d100_dice_face_labels: [' ', '00', '10', '20', '30', '40', '50',
                '60', '70', '80', '90'],
                
        d4_labels: [
            [[], [0, 0, 0], [2, 4, 3], [1, 3, 4], [2, 1, 4], [1, 2, 3]],
            [[], [0, 0, 0], [2, 3, 4], [3, 1, 4], [2, 4, 1], [3, 2, 1]],
            [[], [0, 0, 0], [4, 3, 2], [3, 4, 1], [4, 2, 1], [3, 1, 2]],
            [[], [0, 0, 0], [4, 2, 3], [1, 4, 3], [4, 1, 2], [1, 3, 2]]
        ]
    }

    // @brief constructor; create a new instance of this to initialize the canvas
    // @param id of canvas
    that.dice_box = function(canvasId) {
        const canvas = document.getElementById(canvasId);
        const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});        
        const scene = new THREE.Scene();

        canvas.onresize = function(renderer) {
            //to change resolution if necessary (for smooth edges)
            if(_resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }   
            function _resizeRendererToDisplaySize(renderer) {
                const canvas = renderer.domElement;        
                const pixelRatio = window.devicePixelRatio;
                const width  = canvas.clientWidth  * pixelRatio | 0;
                const height = canvas.clientHeight * pixelRatio | 0;
                const needResize = canvas.width !== width || canvas.height !== height;
                if (needResize) {
                renderer.setSize(width, height, false);
                }
                return needResize;
            }
        }

        //camera
        const cw = canvas.width / 2;
        const ch = canvas.height /2;
        const as = Math.min(cw, ch);
        const wh = ch / as / Math.tan(10 * Math.PI / 180);

        const fov = 20;
        const aspect = cw / ch;  // the canvas default
        const near = 1;
        const far = wh * 1.3;

        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = wh;

        //light
        var ambientLight = new THREE.AmbientLight(vars.ambient_light_color);
        scene.add(ambientLight);

        scene.add(CREATE.d4());
        
        renderer.render(scene, camera);
    }

    //TODO: move to seperate lib? rn it references vars and CONSTS tho...
    //note this is pretty much a copy/paste of teal's work just w/out all the this assignments to dice_box
    const CREATE = (function() {
        let that = {};

        that.d4 = function() {
            let d4_geometry = create_d4_geometry(vars.scale * 1.2);
            let d4_material = new THREE.MeshFaceMaterial(
                    create_d4_materials(vars.scale / 2, vars.scale * 2, CONSTS.d4_labels[0]));
            return new THREE.Mesh(d4_geometry, d4_material);
        }
    
        that.d6 = function() {
            // let d6_geometry = create_d6_geometry(vars.scale * 1.1);
            // let dice_material = new THREE.MeshFaceMaterial(
            //         create_dice_materials(CONSTS.standart_d20_dice_face_labels, vars.scale / 2, 0.9));
            // return new THREE.Mesh(d6_geometry, dice_material);
            const width = 1;  // ui: width
            const height = 1;  // ui: height
            const depth = 1;  // ui: depth
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshBasicMaterial({color: vars.dice_color});
            return new THREE.Mesh(geometry, material);
        }
    
        that.d8 = function() {
            let d8_geometry = create_d8_geometry(vars.scale);
            let dice_material = new THREE.MeshFaceMaterial(
                    create_dice_materials(CONSTS.standart_d20_dice_face_labels, vars.scale / 2, 1.4));
            return new THREE.Mesh(d8_geometry, dice_material);
        }
    
        that.d10 = function() {
            let d10_geometry = create_d10_geometry(vars.scale * 0.9);
            let dice_material = new THREE.MeshFaceMaterial(
                    create_dice_materials(CONSTS.standart_d20_dice_face_labels, vars.scale / 2, 1.0));
            return new THREE.Mesh(d10_geometry, dice_material);
        }
    
        that.d12 = function() {
            let d12_geometry = create_d12_geometry(vars.scale * 0.9);
            let dice_material = new THREE.MeshFaceMaterial(
                    create_dice_materials(CONSTS.standart_d20_dice_face_labels, vars.scale / 2, 1.0));
            return new THREE.Mesh(d12_geometry, dice_material);
        }
    
        that.d20 = function() {
            let d20_geometry = create_d20_geometry(vars.scale);
            let dice_material = new THREE.MeshFaceMaterial(
                    create_dice_materials(CONSTS.standart_d20_dice_face_labels, vars.scale / 2, 1.2));
            return new THREE.Mesh(d20_geometry, dice_material);
        }
    
        that.d100 = function() {
            let d10_geometry = create_d10_geometry(vars.scale * 0.9);
            let d100_material = new THREE.MeshFaceMaterial(
                    create_dice_materials(CONSTS.standart_d100_dice_face_labels, vars.scale / 2, 1.5));
            return new THREE.Mesh(d10_geometry, d100_material);
        }

        //materials

        function create_dice_materials(face_labels, size, margin) {
            function create_text_texture(text, color, back_color) {
                if (text == undefined) return null;
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                var ts = calc_texture_size(size + size * 2 * margin) * 2;
                canvas.width = canvas.height = ts;
                context.font = ts / (1 + 2 * margin) + "pt Arial";
                context.fillStyle = back_color;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillStyle = color;
                context.fillText(text, canvas.width / 2, canvas.height / 2);
                if (text == '6' || text == '9') {
                    context.fillText('  .', canvas.width / 2, canvas.height / 2);
                }
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return texture;
            }
            var materials = [];
            for (var i = 0; i < face_labels.length; ++i)
                materials.push(new THREE.MeshPhongMaterial($t.copyto(vars.material_options,
                            { map: create_text_texture(face_labels[i], vars.label_color, vars.dice_color) })));
            return materials;
        }
    
        function create_d4_materials(size, margin, labels) {
            function create_d4_text(text, color, back_color) {
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                var ts = calc_texture_size(size + margin) * 2;
                canvas.width = canvas.height = ts;
                context.font = (ts - margin) * 0.5 + "pt Arial";
                context.fillStyle = back_color;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillStyle = color;
                for (var i in text) {
                    context.fillText(text[i], canvas.width / 2,
                            canvas.height / 2 - ts * 0.3);
                    context.translate(canvas.width / 2, canvas.height / 2);
                    context.rotate(Math.PI * 2 / 3);
                    context.translate(-canvas.width / 2, -canvas.height / 2);
                }
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return texture;
            }
            var materials = [];
            for (var i = 0; i < labels.length; ++i)
                materials.push(new THREE.MeshPhongMaterial($t.copyto(vars.material_options,
                            { map: create_d4_text(labels[i], vars.label_color, vars.dice_color) })));
            return materials;
        }

        //geometries
    
        function create_d4_geometry(radius) {
            var vertices = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
            var faces = [[1, 0, 2, 1], [0, 1, 3, 2], [0, 3, 2, 3], [1, 2, 3, 4]];
            return create_geom(vertices, faces, radius, -0.1, Math.PI * 7 / 6, 0.96);
        }
    
        function create_d6_geometry(radius) {
            var vertices = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
            var faces = [[0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3],
                    [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]];
            return create_geom(vertices, faces, radius, 0.1, Math.PI / 4, 0.96);
        }
    
        function create_d8_geometry(radius) {
            var vertices = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
            var faces = [[0, 2, 4, 1], [0, 4, 3, 2], [0, 3, 5, 3], [0, 5, 2, 4], [1, 3, 4, 5],
                    [1, 4, 2, 6], [1, 2, 5, 7], [1, 5, 3, 8]];
            return create_geom(vertices, faces, radius, 0, -Math.PI / 4 / 2, 0.965);
        }
    
        function create_d10_geometry(radius) {
            var a = Math.PI * 2 / 10, k = Math.cos(a), h = 0.105, v = -1;
            var vertices = [];
            for (var i = 0, b = 0; i < 10; ++i, b += a)
                vertices.push([Math.cos(b), Math.sin(b), h * (i % 2 ? 1 : -1)]);
            vertices.push([0, 0, -1]); vertices.push([0, 0, 1]);
            var faces = [[5, 7, 11, 0], [4, 2, 10, 1], [1, 3, 11, 2], [0, 8, 10, 3], [7, 9, 11, 4],
                    [8, 6, 10, 5], [9, 1, 11, 6], [2, 0, 10, 7], [3, 5, 11, 8], [6, 4, 10, 9],
                    [1, 0, 2, v], [1, 2, 3, v], [3, 2, 4, v], [3, 4, 5, v], [5, 4, 6, v],
                    [5, 6, 7, v], [7, 6, 8, v], [7, 8, 9, v], [9, 8, 0, v], [9, 0, 1, v]];
            return create_geom(vertices, faces, radius, 0, Math.PI * 6 / 5, 0.945);
        }
    
        function create_d12_geometry(radius) {
            var p = (1 + Math.sqrt(5)) / 2, q = 1 / p;
            var vertices = [[0, q, p], [0, q, -p], [0, -q, p], [0, -q, -p], [p, 0, q],
                    [p, 0, -q], [-p, 0, q], [-p, 0, -q], [q, p, 0], [q, -p, 0], [-q, p, 0],
                    [-q, -p, 0], [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1],
                    [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]];
            var faces = [[2, 14, 4, 12, 0, 1], [15, 9, 11, 19, 3, 2], [16, 10, 17, 7, 6, 3], [6, 7, 19, 11, 18, 4],
                    [6, 18, 2, 0, 16, 5], [18, 11, 9, 14, 2, 6], [1, 17, 10, 8, 13, 7], [1, 13, 5, 15, 3, 8],
                    [13, 8, 12, 4, 5, 9], [5, 4, 14, 9, 15, 10], [0, 12, 8, 10, 16, 11], [3, 19, 7, 17, 1, 12]];
            return create_geom(vertices, faces, radius, 0.2, -Math.PI / 4 / 2, 0.968);
        }
    
        function create_d20_geometry(radius) {
            var t = (1 + Math.sqrt(5)) / 2;
            var vertices = [[-1, t, 0], [1, t, 0 ], [-1, -t, 0], [1, -t, 0],
                    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
                    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
            var faces = [[0, 11, 5, 1], [0, 5, 1, 2], [0, 1, 7, 3], [0, 7, 10, 4], [0, 10, 11, 5],
                    [1, 5, 9, 6], [5, 11, 4, 7], [11, 10, 2, 8], [10, 7, 6, 9], [7, 1, 8, 10],
                    [3, 9, 4, 11], [3, 4, 2, 12], [3, 2, 6, 13], [3, 6, 8, 14], [3, 8, 9, 15],
                    [4, 9, 5, 16], [2, 4, 11, 17], [6, 2, 10, 18], [8, 6, 7, 19], [9, 8, 1, 20]];
            return create_geom(vertices, faces, radius, -0.2, -Math.PI / 4 / 2, 0.955);
        }

        //helpers

        function create_geom(vertices, faces, radius, tab, af, chamfer) {
            var vectors = new Array(vertices.length);
            for (var i = 0; i < vertices.length; ++i) {
                vectors[i] = (new THREE.Vector3).fromArray(vertices[i]).normalize();
            }
            var cg = chamfer_geom(vectors, faces, chamfer);
            var geom = make_geom(cg.vectors, cg.faces, radius, tab, af);
            //var geom = make_geom(vectors, faces, radius, tab, af); // Without chamfer
            geom.cannon_shape = create_shape(vectors, faces, radius);
            return geom;
        }

        function create_shape(vertices, faces, radius) {
            var cv = new Array(vertices.length), cf = new Array(faces.length);
            for (var i = 0; i < vertices.length; ++i) {
                var v = vertices[i];
                cv[i] = new CANNON.Vec3(v.x * radius, v.y * radius, v.z * radius);
            }
            for (var i = 0; i < faces.length; ++i) {
                cf[i] = faces[i].slice(0, faces[i].length - 1);
            }
            return new CANNON.ConvexPolyhedron(cv, cf);
        }
    
        function make_geom(vertices, faces, radius, tab, af) {
            var geom = new THREE.PolyhedronGeometry();
            for (var i = 0; i < vertices.length; ++i) {
                var vertex = vertices[i].multiplyScalar(radius);
                vertex.index = geom.vertices.push(vertex) - 1;
            }
            for (var i = 0; i < faces.length; ++i) {
                var ii = faces[i], fl = ii.length - 1;
                var aa = Math.PI * 2 / fl;
                for (var j = 0; j < fl - 2; ++j) {
                    geom.faces.push(new THREE.Face3(ii[0], ii[j + 1], ii[j + 2], [geom.vertices[ii[0]],
                                geom.vertices[ii[j + 1]], geom.vertices[ii[j + 2]]], 0, ii[fl] + 1));
                    geom.faceVertexUvs[0].push([
                            new THREE.Vector2((Math.cos(af) + 1 + tab) / 2 / (1 + tab),
                                (Math.sin(af) + 1 + tab) / 2 / (1 + tab)),
                            new THREE.Vector2((Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
                                (Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)),
                            new THREE.Vector2((Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
                                (Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab))]);
                }
            }
            geom.computeFaceNormals();
            geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
            return geom;
        }
    
        function chamfer_geom(vectors, faces, chamfer) {
            var chamfer_vectors = [], chamfer_faces = [], corner_faces = new Array(vectors.length);
            for (var i = 0; i < vectors.length; ++i) corner_faces[i] = [];
            for (var i = 0; i < faces.length; ++i) {
                var ii = faces[i], fl = ii.length - 1;
                var center_point = new THREE.Vector3();
                var face = new Array(fl);
                for (var j = 0; j < fl; ++j) {
                    var vv = vectors[ii[j]].clone();
                    center_point.add(vv);
                    corner_faces[ii[j]].push(face[j] = chamfer_vectors.push(vv) - 1);
                }
                center_point.divideScalar(fl);
                for (var j = 0; j < fl; ++j) {
                    var vv = chamfer_vectors[face[j]];
                    vv.subVectors(vv, center_point).multiplyScalar(chamfer).addVectors(vv, center_point);
                }
                face.push(ii[fl]);
                chamfer_faces.push(face);
            }
            for (var i = 0; i < faces.length - 1; ++i) {
                for (var j = i + 1; j < faces.length; ++j) {
                    var pairs = [], lastm = -1;
                    for (var m = 0; m < faces[i].length - 1; ++m) {
                        var n = faces[j].indexOf(faces[i][m]);
                        if (n >= 0 && n < faces[j].length - 1) {
                            if (lastm >= 0 && m != lastm + 1) pairs.unshift([i, m], [j, n]);
                            else pairs.push([i, m], [j, n]);
                            lastm = m;
                        }
                    }
                    if (pairs.length != 4) continue;
                    chamfer_faces.push([chamfer_faces[pairs[0][0]][pairs[0][1]],
                            chamfer_faces[pairs[1][0]][pairs[1][1]],
                            chamfer_faces[pairs[3][0]][pairs[3][1]],
                            chamfer_faces[pairs[2][0]][pairs[2][1]], -1]);
                }
            }
            for (var i = 0; i < corner_faces.length; ++i) {
                var cf = corner_faces[i], face = [cf[0]], count = cf.length - 1;
                while (count) {
                    for (var m = faces.length; m < chamfer_faces.length; ++m) {
                        var index = chamfer_faces[m].indexOf(face[face.length - 1]);
                        if (index >= 0 && index < 4) {
                            if (--index == -1) index = 3;
                            var next_vertex = chamfer_faces[m][index];
                            if (cf.indexOf(next_vertex) >= 0) {
                                face.push(next_vertex);
                                break;
                            }
                        }
                    }
                    --count;
                }
                face.push(-1);
                chamfer_faces.push(face);
            }
            return { vectors: chamfer_vectors, faces: chamfer_faces };
        }

        return that;
    }());

    return that;
}());