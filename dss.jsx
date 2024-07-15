(function(thisObj) {
    function dheemansSecretSauce(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Dheeman's Secret Sauce", undefined, {resizeable:true});

        var res =
        "group { \
            orientation:'column', alignment:['fill','fill'], \
            header: Group { \
                alignment:['fill','top'], \
                title: StaticText { text:'Dheeman\\'s Secret Sauce', alignment:['fill','center'] }, \
                help: Button { text:'?', maximumSize:[30,20], alignment:['right','center'] }, \
            }, \
            main: Panel { \
                text: 'Main', \
                orientation:'column', alignment:['fill','top'], \
                adjustmentBtn: Button { text:'Adj.', alignment:['fill','top'], preferredSize:[-1,20] }, \
                nullBtn: Button { text:'Null', alignment:['fill','top'], preferredSize:[-1,20] }, \
                cameraBtn: Button { text:'Cam', alignment:['fill','top'], preferredSize:[-1,20] }, \
                solidBtn: Button { text:'Solid', alignment:['fill','top'], preferredSize:[-1,20] }, \
                shapeBtn: Button { text:'Shape', alignment:['fill','top'], preferredSize:[-1,20] }, \
                oneFrameAdjBtn: Button { text:'1 Frame', alignment:['fill','top'], preferredSize:[-1,20] }, \
            }, \
            preset: Panel { \
                text: 'Preset', \
                orientation:'column', alignment:['fill','top'], \
                favBtn: Button { text:'Add Fav', alignment:['fill','top'], preferredSize:[-1,20] }, \
                favPresets: Group { orientation:'column', alignment:['fill','top'] }, \
            }, \
            keyframes: Panel { \
                text: 'Keyframes', \
                orientation:'column', alignment:['fill','top'], \
                easyEaseBtn: Button { text:'Easy Ease', alignment:['fill','top'], preferredSize:[-1,20] }, \
                autoKeyframeBtn: Button { text:'Auto Keyframe', alignment:['fill','top'], preferredSize:[-1,20] }, \
            }, \
            about: Panel { \
                text: 'About', \
                orientation:'column', alignment:['fill','top'], \
                aboutText: StaticText { text:'Made by', alignment:['fill','top'] }, \
                instagramLink: Button { text:'Dheeman', alignment:['fill','top'], preferredSize:[-1,20] }, \
            } \
        }";

        myPanel.grp = myPanel.add(res);

        myPanel.grp.header.help.onClick = function() {
            alert("This script adds new layers, applies presets, and provides keyframe utilities.", "Help");
        };

        function addLayer(type) {
            var comp = app.project.activeItem;
            if (comp instanceof CompItem) {
                var selectedLayer = comp.selectedLayers[0];
                if (selectedLayer) {
                    var inPoint = selectedLayer.inPoint;
                    var outPoint = selectedLayer.outPoint;
                    var duration = outPoint - inPoint;

                    app.beginUndoGroup("Add " + type + " Layer");

                    var newLayer;
                    switch(type) {
                        case "Adjustment":
                            newLayer = comp.layers.addSolid([1, 1, 1], "Adjustment Layer", comp.width, comp.height, comp.pixelAspect, duration);
                            newLayer.adjustmentLayer = true;
                            break;
                        case "Camera":
                            newLayer = comp.layers.addCamera("Camera", [comp.width/2, comp.height/2]);
                            break;
                        case "Null":
                            newLayer = comp.layers.addNull(duration);
                            break;
                        case "Shape":
                            newLayer = comp.layers.addShape();
                            break;
                        case "Solid":
                            newLayer = comp.layers.addSolid([1, 1, 1], "Solid Layer", comp.width, comp.height, comp.pixelAspect, duration);
                            break;
                        case "Text":
                            newLayer = comp.layers.addText("New Text Layer");
                            break;
                        case "1 Frame Adjustment":
                            var frameDuration = 1 / comp.frameRate;
                            var currentTime = comp.time;
                            newLayer = comp.layers.addSolid([1, 1, 1], "1 Frame Adjustment Layer", comp.width, comp.height, comp.pixelAspect, frameDuration);
                            newLayer.adjustmentLayer = true;
                            newLayer.startTime = currentTime + frameDuration;
                            newLayer.inPoint = newLayer.startTime;
                            newLayer.outPoint = newLayer.startTime + frameDuration;
                            break;
                    }

                    if (newLayer && type !== "1 Frame Adjustment") {
                        newLayer.inPoint = inPoint;
                        newLayer.outPoint = outPoint;
                    }

                    app.endUndoGroup();
                } else {
                    alert("Please select a layer first.");
                }
            } else {
                alert("Please select a composition first.");
            }
        }

        function addFavoritePreset() {
            var presetFile = File.openDialog("Select a preset file", "*.ffx");
            if (presetFile != null) {
                var presetName = decodeURI(presetFile.name).replace(/\.ffx$/, '');

                var presetBtn = myPanel.grp.cmds.favPresets.add("button", undefined, presetName);
                var textWidth = presetBtn.graphics.measureString(presetName)[0];
                presetBtn.size = [textWidth + 4, presetBtn.size[1]];
                presetBtn.onClick = function() {
                    var comp = app.project.activeItem;
                    if (comp instanceof CompItem) {
                        var selectedLayer = comp.selectedLayers[0];
                        if (selectedLayer) {
                            app.beginUndoGroup("Apply Preset " + presetName);
                            selectedLayer.applyPreset(presetFile);
                            app.endUndoGroup();
                        } else {
                            alert("Please select a layer first.");
                        }
                    } else {
                        alert("Please select a composition first.");
                    }
                };

                myPanel.layout.layout(true);
            }
        }

        function easyEase() {
            var comp = app.project.activeItem;
            if (comp instanceof CompItem) {
                var selectedProps = comp.selectedProperties;
                if (selectedProps.length > 0) {
                    app.beginUndoGroup("Apply Easy Ease");
                    for (var i = 0; i < selectedProps.length; i++) {
                        var prop = selectedProps[i];
                        if (prop.canVaryOverTime) {
                            for (var j = 0; j < prop.selectedKeys.length; j++) {
                                var keyIndex = prop.selectedKeys[j];
                                prop.setTemporalEaseAtKey(keyIndex, [new KeyframeEase(0, 33)], [new KeyframeEase(0, 33)]);
                            }
                        }
                    }
                    app.endUndoGroup();
                } else {
                    alert("Please select at least one property with keyframes.");
                }
            } else {
                alert("Please select a composition first.");
            }
        }

        function autoKeyframe() {
            var comp = app.project.activeItem;
            if (comp instanceof CompItem) {
                var selectedLayers = comp.selectedLayers;
                if (selectedLayers.length > 0) {
                    app.beginUndoGroup("Auto Keyframe");
                    for (var i = 0; i < selectedLayers.length; i++) {
                        var layer = selectedLayers[i];
                        var selectedProps = layer.selectedProperties;
                        for (var j = 0; j < selectedProps.length; j++) {
                            var prop = selectedProps[j];
                            if (prop.canVaryOverTime) {
                                prop.setValueAtTime(layer.inPoint, prop.valueAtTime(layer.inPoint, true));
                                prop.setValueAtTime(layer.outPoint, prop.valueAtTime(layer.outPoint, true));
                            }
                        }
                    }
                    app.endUndoGroup();
                } else {
                    alert("Please select at least one layer.");
                }
            } else {
                alert("Please select a composition first.");
            }
        }

        // Main Panel
        if (myPanel.grp.main) {
            myPanel.grp.main.adjustmentBtn.onClick = function() { addLayer("Adjustment"); };
            myPanel.grp.main.nullBtn.onClick = function() { addLayer("Null"); };
            myPanel.grp.main.cameraBtn.onClick = function() { addLayer("Camera"); };
            myPanel.grp.main.solidBtn.onClick = function() { addLayer("Solid"); };
            myPanel.grp.main.shapeBtn.onClick = function() { addLayer("Shape"); };
            myPanel.grp.main.oneFrameAdjBtn.onClick = function() { addLayer("1 Frame Adjustment"); };
        } else {
            alert("Main panel not found");
        }

        // Preset Panel
        if (myPanel.grp.preset && myPanel.grp.preset.favBtn) {
            myPanel.grp.preset.favBtn.onClick = function() { addFavoritePreset(); };
        } else {
            alert("Preset panel or favBtn not found");
        }

        // Keyframes Panel
        if (myPanel.grp.keyframes) {
            myPanel.grp.keyframes.easyEaseBtn.onClick = function() { easyEase(); };
            myPanel.grp.keyframes.autoKeyframeBtn.onClick = function() { autoKeyframe(); };
        } else {
            alert("Keyframes panel not found");
        }

        // About Panel
        myPanel.grp.about.instagramLink.onClick = function() {
            if ($.os.indexOf("Windows") !== -1) {
                app.system('start "" "https://www.instagram.com/hotpauseee"');
            } else {
                app.system('open "https://www.instagram.com/hotpauseee"');
            }
        };

        if (myPanel.layout && myPanel.layout.layout) {
            myPanel.layout.layout(true);
        } else {
            alert("Unable to perform layout");
        }

        if (myPanel.grp && myPanel.grp.size) {
            myPanel.grp.minimumSize = myPanel.grp.size;
        } else {
            alert("Unable to set minimum size");
        }

        if (myPanel.layout && myPanel.layout.resize) {
            myPanel.layout.resize();
        } else {
            alert("Unable to resize layout");
        }

        myPanel.onResizing = myPanel.onResize = function () {
            if (this.layout && this.layout.resize) {
                this.layout.resize();
            }
        };

        return myPanel;
    }

    var myScriptPal = dheemansSecretSauce(thisObj);
    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    } else {
        alert("Failed to create script palette");
    }
})(this);