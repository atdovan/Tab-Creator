FretBoard = function(_parentElement) {
    this.parentElement = _parentElement
    this.sixth = "E";
    this.fifth = "A";
    this.fourth = "D";
    this.third = "G";
    this.second = "B";
    this.first = "e";

    this.fret_count = 22;
    this.current_click = ["-", "-", "-", "-", "-", "-"];
    this.current_highlight = ["-", "-", "-", "-", "-", "-"];
    this.current_tone = "-";

    this.root = false;
    this.third_s = false;
    this.fifth_s = false;

    this.initVis();
};

FretBoard.prototype.initVis = function() {
    var vis = this;

    // Filling the variable string list
    string_list = [vis.first, vis.second, vis.third, vis.fourth, vis.fifth, vis.sixth];

    // Filling the tab_memory string list
    tab_memory = []
    for (var i =0; i < 6; i++) {
        tab_memory.push(["|"])
    }

    // Define the svg size
    vis.margin = { left: 0, right: 0, bottom: 15, top: 0}
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // Creating the svg
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height +  vis.margin.top + vis.margin.bottom)
        .attr("class", "fretboard");

    // Creating the backdrop rectangle
    vis.backdrop = vis.svg.append("rect")
        .attr("id", "fret_backdrop")
        .attr("x", vis.margin.left)
        .attr("y", vis.margin.top)
        .attr('width', vis.width)
        .attr("height", vis.height)
        .attr("fill", "black");

    // Set the height of the button column
    document.getElementById("tuners").style.height = vis.height.toString() + "px"
    var tuners = document.getElementsByClassName("tuner_select");
    // document.getElementsByClassName("tuner_select").style.height
    for (var i = 0; i < 6; i++) {
        tuners[i].style.height = (vis.height/6).toString() + "px"
    }

    // Adding the sensor rectangles for key highlighting
    for (var f = 0; f <= vis.fret_count; f++) {
        for (var s = 0; s < 6; s++) {
            // fret highlighting
            vis.svg.append("rect")
                .attr("class", "fret_key")
                .attr("id", "fk_f" + f.toString() + "s" + (s+1).toString())
                .attr("x", function() {
                    if (f == 0) {return 0}
                    else {return 1.5 + vis.margin.left + (vis.width/vis.fret_count) * f}
                })
                .attr("y", (vis.height/6 * s))
                .attr("width", function() {
                    if (f == 0) {return vis.width/vis.fret_count + 2.5}
                    else {return vis.width/vis.fret_count + 1.5}
                })
                .attr("height", vis.height/6 + .5)
                .attr("fill", "#4F4F4F")
                .style("opacity", 0)
        }
    }

    // Creating the strings, frets, and fret inlays
    for (var i = 1; i <= vis.fret_count; i++) {
        vis.svg.append("rect")
            .attr("class", "fret")
            .attr("x", vis.margin.left + vis.width/vis.fret_count * i)
            .attr("y", 0)
            .attr('width', 3)
            .attr("height", vis.height)
            .attr("fill", "silver")
            .style("opacity", .75);
    }

    var inlays = [3, 5, 7, 9, 15, 17, 19, 21]
    for (var i = 0; i < inlays.length; i++) {
        vis.svg.append("circle")
            .attr("class", "inlay")
            .attr("cy", vis.height/2)
            .attr("cx", vis.margin.left + vis.width/vis.fret_count * (inlays[i]+.5) + 1)
            .attr("r", 6.5)
            .attr("fill", "white")
            .style("opacity", .9)
    }

    for (var i = 1; i < 3; i++) {
        vis.svg.append("circle")
            .attr("class", "inlay")
            .attr("cy", (i*vis.height)/3)
            .attr("cx", vis.margin.left + vis.width/vis.fret_count * (12+.5) + 1)
            .attr("r", 6.5)
            .attr("fill", "white")
            .style("opacity", .9)
    }

    var strings = [1, 2, 3, 4, 5, 6]
    for (var i = 0; i < strings.length; i++) {
        vis.svg.append("rect")
            .attr("class", "string")
            .attr("id", "string_" + strings[i].toString())
            .attr("x", vis.margin.left)
            .attr("y", vis.height/12 + vis.height/6 * (strings[i]-1))
            .attr('width', vis.width)
            .attr("height", strings[i]*.75)
            .attr("fill", function() {
                if (i < 2) {return "silver"}
                else {return "goldenrod"}
            });
    }

    // Adding the sensor rectangles for each fret and the fret counters
    for (var f = 0; f <= vis.fret_count; f++) {
        for (var s = 0; s < 6; s++) {
            // fret clicking
            vis.svg.append("rect")
                .attr("class", "fret_box")
                .attr("id", "fb_f" + f.toString() + "s" + (s+1).toString())
                .attr("x", function() {
                    if (f === 0) {return 2}
                    else {return vis.margin.left + vis.width/vis.fret_count * f + 5}
                })
                .attr("y", (vis.height/6 * s) + 2)
                .attr("width", function() {
                    if (f == 0) {return vis.width/vis.fret_count - 4}
                    else {return vis.width/vis.fret_count - 7}
                })
                .attr("height", vis.height/6 - 4)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "white")
                .style("opacity", 0);
        }

        vis.svg.append("text")
            .attr("x", function() {
                if (f === 0) {return 2 + (vis.width/vis.fret_count - 3)/2}
                else {return vis.margin.left + vis.width/vis.fret_count * f + 4 + (vis.width/vis.fret_count - 7)/2}
            })
            .attr("y", vis.height + vis.margin.bottom/1.5)
            .text(f)
            .attr("alignment-baseline", "middle")
            .style("text-anchor", "middle");

    }

    vis.createFunctions()
};

FretBoard.prototype.createFunctions = function() {
    var vis = this;

    // Adding the mouseover opacity function
    vis.svg.selectAll(".fret_box")
        .on("mouseover", function() {
            d3.select(this).style("opacity", .75);
        })
        .on("mouseout", function() {
            if (!vis.current_highlight.includes(this.id)) {
                d3.select(this).style("opacity", 0);
            }
        })
        .on("click", function() {
            // Getting the fret and string combination in integers
            var id = d3.select(this).attr('id');
            var fret_string = id.split("fb_f")[1].split("s");
            var fret = parseInt(fret_string[0]);
            var string = parseInt(fret_string[1]);

            // Checking to see if multi-click is on
            if (multiple === true) {
                // Making sure it remains highlighted if clicked
                d3.select(this).style("opacity", .75);

                // Making sure any other string has its highlight removed
                var old_highlight = vis.current_highlight[string-1];
                if (old_highlight !== '-') {
                    d3.select("#" + old_highlight).style("opacity", 0)
                }
                vis.current_highlight[string-1] = this.id;

                // Update the tab memory
                vis.current_click[string-1] = fret.toString()
            }
            else {
                // updating tab memory
                vis.current_click[string-1] = fret.toString()
                vis.shiftReleased();
            }
        })
};

FretBoard.prototype.shiftReleased = function() {
    var vis = this;

    // Adding the dash for after automatically
    // If there is a tonal, add it as well
    for (var j = 0; j < 6; j++) {
        var insertAt = (typeof insert_mode !== 'undefined' && insert_mode) ? Tab.counter : Tab.counter+1;
        tab_memory[j].splice(insertAt, 0, "-");
        if (Tab.counter > 0) {
            if (vis.current_click[j] !== "-" && vis.current_click[j] !== "--") {
                if (tab_memory[j][Tab.counter-1] !== "-" && tab_memory[j][Tab.counter-1] !== "--") {
                    tab_memory[j][Tab.counter] = vis.current_tone;
                } else if (vis.current_tone == "/" || vis.current_tone == "\\") {
                    tab_memory[j][Tab.counter] = vis.current_tone;
                }
            }
        }
    }

    // Resetting the variable
    vis.current_tone = "-";

    // Toggling off all the other variables
    toggle_off(Legend.hammer); hammer_on = false;
    toggle_off(Legend.pull); pull_off = false;
    toggle_off(Legend.slide_up); slide_up = false;
    toggle_off(Legend.slide_down); slide_down = false;
    toggle_off(Legend.bend); bend = false;
    toggle_off(Legend.release); release = false;

    // Updating tab_memory if space was clicked
    if (space === true) {
        for (var j = 0; j < 6; j++) {
            var insertAt = (typeof insert_mode !== 'undefined' && insert_mode) ? Tab.counter : Tab.counter+1;
            tab_memory[j].splice(insertAt, 0, "-");
        }
        space = false
    }

    // Updating tab_memory if not the current click
    else if (vis.current_click.join('') !== "------") {
        // Checking to see if a fret is double digits
        var check = false;

        for (var i = 0; i < 6; i++) {
            if (vis.current_click[i].length > 1) {
                check = true
            }
        }

        if (check) {
            for (var i = 0; i < 6; i++) {
                if (vis.current_click[i].length === 1) {
                    vis.current_click[i] = vis.current_click[i] + '-'
                }
            }
        }

        // updating tab memory
        for (var j = 0; j < 6; j++) {
            var insertAt = (typeof insert_mode !== 'undefined' && insert_mode) ? Tab.counter : Tab.counter+1;
            tab_memory[j].splice(insertAt, 0, vis.current_click[j]);
        }

        // reverting back
        vis.current_click = ["-", "-", "-", "-", "-", "-"];
        for (var i = 0; i < 6; i++) {
            var c_h = vis.current_highlight[i]
            if (c_h !== "-") {d3.select("#" + c_h).style("opacity", 0)}
        }
    }

    // Toggling off the current highlight
    vis.current_highlight = ["-", "-", "-", "-", "-", "-"]

    Tab.counter = (typeof insert_mode !== 'undefined' && insert_mode) ? Tab.counter + 1 : Tab.counter + 2;

    Tab.TabAddition();
};

FretBoard.prototype.keyChange = function() {
    var vis = this;

    if (confirm("Do you want to change key? Current tab and saved chords will be removed.") == true) {
        vis.first = d3.select("#tuner_1").property("value");
        vis.second = d3.select("#tuner_2").property("value");
        vis.third = d3.select("#tuner_3").property("value");
        vis.fourth = d3.select("#tuner_4").property("value");
        vis.fifth = d3.select("#tuner_5").property("value");
        vis.sixth = d3.select("#tuner_6").property("value");

        // Removing the saved chords
        Saved.clearChord()

        // Removing the highlights
        vis.shiftReleased()

        // Removing the current selection
        vis.current_click = ["-", "-", "-", "-", "-", "-"];
        vis.current_highlight = ["-", "-", "-", "-", "-", "-"];
        vis.current_tone = "-";

        // Toggling off all variables
        toggle_off(Legend.shift); multiple = false;
        toggle_off(Legend.hammer); hammer_on = false;
        toggle_off(Legend.pull); pull_off = false;
        toggle_off(Legend.slide_up); slide_up = false;
        toggle_off(Legend.slide_down); slide_down = false;
        toggle_off(Legend.bend); bend = false;
        toggle_off(Legend.release); release = false;

        // Updating the tab
        Tab.clearTab()

        // Changing the key
        vis.updateKey()
    }
};

FretBoard.prototype.updateKey = function() {
    var vis = this;

    // Getting the node and the mode of the key
    var note = d3.select("#key_note").property("value");
    var mode = d3.select("#key_mode").property("value");

    // Deciding which key to use
    var key;
    if (mode === "Major") {key = major}
    else if (mode === "Minor") {key = minor}
    else if (mode === "Major_pent") {key = major_pent}
    else if (mode === "Minor_pent") {key = minor_pent}

    // Getting the notes which are in the key
    if (note === '-' || mode === '-') {vis.svg.selectAll(".fret_key").style("opacity", 0)}
    else {
        // Getting the value of the note
        var note_val = scale_map[note]

        // Iterating through the strings
        string_list = [vis.first, vis.second, vis.third, vis.fourth, vis.fifth, vis.sixth];

        for (var i = 0; i < string_list.length; i++) {
            // Seeing if each fret is valid in the key or not
            var string_val = scale_map[string_list[i]];

            for (var j = 0; j < vis.fret_count; j++) {
                var v = (string_val + j + 12 - note_val) % 12;

                var note = vis.svg.select("#fk_f" + j.toString() + "s" + (i+1).toString());

                // Highlighting based on if its the scale's 3rd or 5th
                if (key[v] === true) {
                    if (v === 0 & vis.root) {note.attr("fill", "#ff5d47").style("opacity", .75)}
                    else if ((v === 3 || v == 4) & vis.third_s) {note.attr("fill", "#5ec479").style("opacity", .75)}
                    else if (v === 7 & vis.fifth_s) {note.attr("fill", "#5ea0c4").style("opacity", .75)}

                    else {note.attr("fill", "#4F4F4F").style("opacity", .75)}
                }
                else {note.attr("fill", "#4F4F4F").style("opacity", 0)}
            }
        }
    }
};

FretBoard.prototype.rootHighlight = function () {
    var vis = this;

    // Reverse the root
    vis.root = !vis.root;

    // Reverse the color
    if (vis.root) {
        document.getElementById("button_r").style.borderColor = "#ff5d47";
    }
    else {document.getElementById("button_r").style.borderColor = "lightgrey";}

    // Call update key
    vis.updateKey()
};

FretBoard.prototype.thirdHighlight = function () {
    var vis = this;

    // Reverse the root
    vis.third_s = !vis.third_s;

    // Reverse the color
    if (vis.third_s) {document.getElementById("button_3").style.borderColor = "green";}
    else {document.getElementById("button_3").style.borderColor = "lightgrey";}

    // Call update key
    vis.updateKey()
};

FretBoard.prototype.fifthHighlight = function () {
    var vis = this;

    // Reverse the root
    vis.fifth_s = !vis.fifth_s;

    // Reverse the color
    if (vis.fifth_s) {document.getElementById("button_5").style.borderColor = "blue";}
    else {document.getElementById("button_5").style.borderColor = "lightgrey";}


    // Call update key
    vis.updateKey()
};
