
function sortTable(n, table, order) {
    rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = order;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }


function toggleSortingOrder(order){
    switch(order){
        case "asc":
            return "des";
        case "des":
            return "asc";
    }

}
function jsonToTableElement(jsonData, css_selector){
    var keys = []
    var values = []
    var order = "des";
    Objects.keys(jsonData).forEach(key => {
        values.push(jsonData[key]);
        keys.push(key)
    });
    var table = document.createElement('table');
    css_selector.appendChild(table);
    var tableHeaderRow = 0;
    var tableHeaderCell = 0;
    keys.forEach(key => {
        var header = table.createTHead();
        var row = header.insertRow(tableHeaderRow);
        var cell = row.insertCell(tableHeaderCell);
        cell.innerHTML = key;
        tableHeaderCell++;
        tableHeaderRow++;
        cell.addEventListener('click', function(){
            sortTable(key, table, order);
            order = toggleSortingOrder(order);
        });
    });
    var dataCounter = 0;
    var tableBody = table.getElementsByTagName('tbody')[0];
    values.forEach(value => {
        if(dataCounter % keys.length == 0){
            var newRow = tableBody.insertRow();
        }
        var newCell = newRow.insertCell();
        newCell.innerHTML = value;
        dataCounter++;
    })
}