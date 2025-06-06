Tab = function(_parentElement, _fretboard) {
    this.parentElement = _parentElement;
    this.fretboard = _fretboard;
    this.counter = 0;
    this.tab_memory_string = [[], [], [], [], [], []]

    // To get the number of characters a line can hold
    this.max_length = 0;
    this.font_width = 9;

    this.initVis();
};

Tab.prototype.initVis = function() {
    var vis = this;

    // Define the svg size
    vis.margin = {left: 0, right: 0, bottom: 0, top: 20}
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // Creating the svg
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("class", "tab")
        .attr("id", "tab_svg");

    // Creating 6 textboxes
    var v = [FretBoard.first.toLowerCase(), FretBoard.second, FretBoard.third, FretBoard.fourth, FretBoard.fifth, FretBoard.sixth]
    for (var i = 0; i < 6; i++) {
        vis.svg.append("text")
            .attr("class", "tab_text" + i.toString())
            .attr("x", vis.margin.left)
            .attr("y", vis.margin.top + i * 17.5)
            .text(v[i] + " |");
    };

    // Creating the placemarker
    // With this font it is 9 pixels to get from space to space
    vis.mark = vis.svg.append("rect")
        .attr("id", "mark")
        .attr("x", 1 + 9 * 3)
        .attr("y", 7)
        .attr('width', 7)
        .attr("height", 6 * 17.5)
        .attr("fill", "goldenrod")
        .attr("opacity", .7);

    vis.max_length = Math.floor((vis.width-vis.font_width*5)/vis.font_width)
};

function splitString (string, size) {
    var re = new RegExp('.{1,' + size + '}', 'g');
    return string.match(re);
}

Tab.prototype.TabAddition = function() {
    var vis = this;

    // Make tab_key
    vis.makeTabKey()

    // Getting array of the joined strings
    for (var i = 0; i < 6; i++) {
        var s = tab_memory[i].slice(1, tab_memory[0].length).join("")
        vis.tab_memory_string[i] = splitString(s, vis.max_length)
    }

    // Adding the spaces and the key signature
    for (var i = 0; i < 6; i++) {
        if (vis.tab_memory_string[i] == null) {
            vis.tab_memory_string[i] = tab_key[i]
        } else {
            for (var j = 0; j < vis.tab_memory_string[0].length; j++) {
                vis.tab_memory_string[i][j] = tab_key[i] + vis.tab_memory_string[i][j]
            }
        }
    }

    // Adding the text
    for (var i = 0; i < 6; i++) {
        var tab_text = vis.svg.selectAll(".tab_text" + i.toString())
            .data(vis.tab_memory_string[i])

        tab_text.enter().append("text")
            .attr("class", "tab_text" + i.toString())
            .attr("x", vis.margin.left)
            .attr("y", function(d, id) {return vis.margin.top + i*17.5 + 17.6*7*id})
            .text(function(d) {return d})

        tab_text.text(function(d) {return d})

        tab_text.exit().remove()
    };

    vis.MarkerMove();
    if (typeof insert_mode !== 'undefined' && insert_mode) {
        vis.showCursor();
    }
};

Tab.prototype.MarkerMove = function() {
    var vis = this;

    var mark_location = splitString(tab_memory[0].slice(0, vis.counter+1).join(""), vis.max_length)

    // Setting the x value
    vis.mark
        .attr("y", 7 + 17.6*7*(mark_location.length - 1))
        .attr("x", 1 + (2+mark_location[mark_location.length - 1].length)*9)

    if (typeof insert_mode !== 'undefined' && insert_mode) {
        vis.showCursor();
    }
};

Tab.prototype.clearTab = function() {
    var vis = this;

    // Updating the counter
    vis.counter = 0

    // Filling the tab memory
    tab_memory = [];
    for (var i = 0; i < 6; i++) {
        tab_memory.push(["|"])
    }

    // Filling the tab_memory string list
    vis.makeTabKey()
    // vis.TabAddition();
    vis.MarkerMove();

}

Tab.prototype.makeTabKey = function() {
    var vis = this

    // Finding out if there are any flats or not
    tab_key = []
    var key = [FretBoard.first.toLowerCase(), FretBoard.second, FretBoard.third, FretBoard.fourth, FretBoard.fifth, FretBoard.sixth];

    for (var i =0; i < 6; i++) {
        if (key[i].length > 1) {tab_key.push([key[i] + "|"])}
        else {tab_key.push([key[i] + " |"])}
    }
}

Tab.prototype.loadTabFromText = function(text) {
    var vis = this;
    var lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    // Remove header if present
    if (lines[0].startsWith("export_name:")) {
        lines.shift();
    }
    // Remove any empty lines at the start
    while (lines.length && lines[0].trim() === "") lines.shift();
    // Parse blocks of 6 lines
    var blocks = [];
    for (let i = 0; i < lines.length; i += 6) {
        blocks.push(lines.slice(i, i + 6));
    }
    // Rebuild tab_memory
    tab_memory = [[], [], [], [], [], []];
    for (let b = 0; b < blocks.length; b++) {
        let block = blocks[b];
        for (let s = 0; s < 6; s++) {
            let line = block[s] || "";
            // Remove key signature if present
            let pipeIdx = line.indexOf("|");
            if (pipeIdx !== -1) {
                line = line.slice(pipeIdx + 1);
            }
            // Split into characters
            for (let c = 0; c < line.length; c++) {
                if (!tab_memory[s][c]) tab_memory[s][c] = "";
                tab_memory[s][c] += line[c];
            }
        }
    }
    // Fill in missing dashes for short lines
    let maxLen = Math.max(...tab_memory.map(arr => arr.length));
    for (let s = 0; s < 6; s++) {
        for (let c = 0; c < maxLen; c++) {
            if (!tab_memory[s][c]) tab_memory[s][c] = "-";
        }
    }
    // Set counter to end
    Tab.counter = maxLen - 1;
    vis.TabAddition();
};

Tab.prototype.showCursor = function() {
    var vis = this;
    // Remove any existing cursor
    vis.svg.selectAll('.tab_cursor').remove();
    // Calculate position for the cursor
    var x = vis.margin.left + (Tab.counter + 3) * vis.font_width;
    var y = vis.margin.top + insert_cursor_string * 17.5 - 12;
    vis.svg.append('rect')
        .attr('class', 'tab_cursor')
        .attr('x', x)
        .attr('y', y)
        .attr('width', vis.font_width)
        .attr('height', 20)
        .attr('fill', 'orange')
        .attr('opacity', 0.5);
};

Tab.prototype.hideCursor = function() {
    var vis = this;
    vis.svg.selectAll('.tab_cursor').remove();
};

Tab.prototype.toText = function() {
    // Convert tab_memory to 6 lines of text
    let lines = [];
    for (let s = 0; s < 6; s++) {
        let line = tab_memory[s].join("");
        lines.push(line);
    }
    return lines.join("\n");
};

Tab.prototype.fromText = function(text) {
    // Parse 6 lines of text into tab_memory
    let lines = text.split(/\r?\n/);
    for (let s = 0; s < 6; s++) {
        let line = lines[s] || "";
        tab_memory[s] = line.split("");
    }
    Tab.counter = 0;
    this.TabAddition();
};

Tab.prototype.showTextEditor = function() {
    var vis = this;
    // Hide SVG
    $(vis.svg.node()).hide();
    // Show textarea
    if (!$('#tab_textarea').length) {
        $('#tab').append('<textarea id="tab_textarea" style="width:100%;height:100%;font-family:monospace;font-size:16px;resize:none"></textarea>');
    }
    $('#tab_textarea').val(vis.toText()).show().focus();
};

Tab.prototype.hideTextEditor = function() {
    var vis = this;
    // Hide textarea
    let val = $('#tab_textarea').val();
    $('#tab_textarea').hide();
    // Show SVG
    $(vis.svg.node()).show();
    // Parse text back into tab
    vis.fromText(val);
};