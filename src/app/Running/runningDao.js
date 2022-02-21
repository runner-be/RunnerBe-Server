async function sendRequest(connection, sendRequestParams) {
    const query = `
    INSERT INTO RunningPeople (gatheringId, userId) 
    VALUES ((SELECT gatheringId FROM Running WHERE postId = ? ), ?); 
                          `;

    const row = await connection.query(query, sendRequestParams);

    return row;
}

module.exports = { sendRequest };
