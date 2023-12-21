// Convert the prices to numbers for D3 to understand
function updateChart(data) {
  data.forEach((d, i) => {
    d.name = d.name + "_" + i; // Example: "ProductName1"
  });
  // Set dimensions and margins for the graph
  var margin = { top: 100, right: 30, bottom: 200, left: 60 },
    width = 900 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // X axis
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      data.map(function (d) {
        return d.name;
      })
    )
    .padding(0.3); // Increased padding for better visual separation
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .text(function (d) {
      return d.slice(0, d.indexOf("_")); // This will remove the last character from the label
    })
    .style("text-anchor", "end")
    .attr("dx", "-.9em")
    .attr("dy", "-.5em")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px");
  // Y axis
  var y = d3.scaleLinear().domain([0, 150]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y).tickValues(d3.range(0, 160, 10))); // Set ticks every 5

  // Bars
  svg
    .selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.name);
    })
    .attr("y", function (d) {
      return y(d.price);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(d.price);
    })
    .attr("fill", "#69b3a2");

  // Optional: add a label to each bar
  svg
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    // Position the text in the middle of the bar
    .attr("x", function (d) {
      return x(d.name) + x.bandwidth() / 2;
    })
    // Position the text a bit above the bar
    .attr("y", function (d) {
      return y(d.price) - 5;
    })
    .attr("text-anchor", "middle") // Center the text
    .text(function (d) {
      return d.price;
    });
  //New adds

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Item Price Tracker");

  svg
    .selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.name);
    })
    .attr("y", function (d) {
      return y(d.price);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(d.price);
    })
    .attr("fill", "#4e79a7") // Changed to a different color
    .attr("stroke", "#ffffff") // Added white stroke
    .attr("stroke-width", "1px") // Stroke width
    .on("click", (event, d) => {
      console.log("Bar clicked", d); // This should log to the console when a bar is clicked
      openInfoPanel(d);
    })
    .on("mouseover", function () {
      d3.select(this).attr("fill", "#76b7b2");
    }) // Color on hover
    .on("mouseout", function () {
      d3.select(this).attr("fill", "#4e79a7");
    }); // Color when not hovered
}

// DATABASE - NODE ACCESS
function fetchItemsAndUpdateChart() {
  fetch("/api/items")
    .then((response) => response.json())
    .then((data) => {
      // Clear the current chart before redrawing
      d3.select("#chart").html("");

      // Update the chart with the new data
      updateChart(data);
    })
    .catch((error) => console.error("Error fetching items:", error));
}

// Modified addItem function to send the new item to the server
function addItem(event) {
  event.preventDefault();

  var itemName = document.getElementById("itemName").value;
  var itemPrice = document.getElementById("itemPrice").value.replace(",", ".");
  var placeName = document.getElementById("placeName").value;
  var comments = document.getElementById("comments").value;

  fetch("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: itemName,
      price: parseFloat(itemPrice),
      place: placeName,
      comments: comments,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Fetch all items again and update the chart
      fetchItemsAndUpdateChart();
      document.getElementById("itemName").value = "";
      document.getElementById("itemPrice").value = "";
      document.getElementById("placeName").value = "";
      document.getElementById("comments").value = "";
    })
    .catch((error) => console.error("Error adding item:", error));
}

// Call this function on page load to initialize the chart with items from the database
fetchItemsAndUpdateChart();

function openInfoPanel(itemData) {
  console.log("Clicked");
  // Crie o conteúdo do painel com as informações do item
  const panelContent = `
    <h3>Informações do Produto</h3>
    <p>Nome: ${itemData.name.slice(0, itemData.name.indexOf("_"))}</p>
    <p>Preço: ${itemData.price}</p>
    <p>Local de Consumo: ${itemData.place || "Não cadastrado"}</p>
    <p>Comentário: ${itemData?.comments || "Nenhum"}</p>
    <input type="password" id="deletePassword" placeholder="Digite a senha para excluir"/>
    <button onclick="deleteItem(${itemData.id})">Excluir</button>
  `;

  // Selecione o painel pelo ID ou classe e atualize o conteúdo
  const infoPanel = document.getElementById("infoPanel");
  infoPanel.innerHTML = panelContent;

  // Torna o painel visível
  infoPanel.style.display = "block";
}

function deleteItem(itemId) {
  const password = document.getElementById("deletePassword").value;
  fetch(`/api/items/${itemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchItemsAndUpdateChart();
      } else {
        alert("Senha incorreta. Não foi possível excluir o item.");
      }
    })
    .catch((error) => console.error("Error deleting item:", error));
}

let debounceTimer;
function debouncedSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const searchValue = document.getElementById("searchInput").value;
    fetchFilteredItems(searchValue);
  }, 500);
}

function fetchFilteredItems(query) {
  fetch(`/api/items/search?q=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((data) => {
      d3.select("#chart").html("");
      updateChart(data); // Atualize o gráfico com os dados filtrados
    })
    .catch((error) => console.error("Error fetching filtered items:", error));
}

function filterItems() {
  const searchValue = document.getElementById("searchInput").value;
  const priceMin = document.getElementById("priceMin").value;
  const priceMax = document.getElementById("priceMax").value;

  // Agora inclua a faixa de preço na busca
  fetch(
    `/api/items/search?q=${encodeURIComponent(
      searchValue
    )}&min=${priceMin}&max=${priceMax}`
  )
    .then((response) => response.json())
    .then((data) => {
      d3.select("#chart").html("");
      updateChart(data); // Atualize o gráfico com os dados filtrados
    })
    .catch((error) =>
      console.error("Error fetching items with price filter:", error)
    );
}
