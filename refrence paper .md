
CyberSafe: An AI-Powered Multi-Demographic Platform for Real-Time Cyber Threat Detection and Digital Safety Education 
1st Sachin Kamble, 2nd Sarthak Bhamare , 3rd Pavanaraj Patil , 4th Gitesh Patil , 5th Shivam Shinde 
1Department of Information Technology Engineering, SVKM’s Institute of Technology.
Dhule, India
1st sachinkamble@svkm.ac.in
2-5Department of Information Technology Engineering, SVKM’s Institute of Technology.
Dhule, India 
2nd sarthakbhamare12@gmail.com, 3rd pavanrajrp18@gmail.com, 4th giteshpatil@gmail.com,
 5th shindeshiv2004@gmail.com  
 
 
ABSTRACT -
Locating one's way around large railway stations is still a puzzle, especially for first-time users, seniors, as well as physically challenged individuals. Static signage and paper maps do not usually work for guiding users in such fluid environments. This paper presents a solution, TrackIt, which is a 3D map-based indoor navigation framework for railway stations. This system integrates Unity for the 3D visualization and implementation, Python for the pathfinding using the A-star algorithm, and a Node.js backend with spatial PostgreSQL database. The system is capable of outdoor positioning using GPS as well as with an Indoor Positioning System (IPS) which combines Wi-Fi, BLE, and mobile sensors for reliable indoor tracking. A station model for which users can interact by zooming and rotating is constructed in Blender and rendered in Unity to allow real-time routing. Directions are generated using React and dynamically updated based on routes taken by users, accommodating if they deviate from the pre-specified plan. TrackIt, unliyke other systems that require AR headsets or proprietary hardware, is designed for laptops and smartphones so it is affordable and flexible. Results from preliminary user tests suggest that confusion for most users is reduced and they are able to identify routes faster, which promises a lot for improving navigation at the station.
Keywords – TrackIt, Railway Stations, Indoor Navigation, 3D Mapping, Unity Visualization, A Pathfinding, Indoor Positioning System (IPS), Real-time Navigation, Accessibility in Transportation*

I. INTRODUCTION
Railway stations are significant components of transport infrastructure as they serve the daily needs of millions of commuters. Getting around these large and complex places can be difficult for the elderly, disabled and even first-time travelers, as well as tourists. Static maps and signs do not offer timely, easy-to-withstand navigation which leads to delays and confusion.  
Towards the end of the 20th century, the introduction of technology and digital solutions brought about a far greater development than static maps and signs. Users could look for their desired locations on digital directories and, through the use of interactive kiosks, get step by step visual instructions to navigate complex areas.  
With regards to railway stations, the importance of indoor navigation systems is greatly underestimated. However this has been improving and there is now evidence showing that insight navigation aids noticeably enhance passengers’ experience, check-in confusion, and streamline processes at transit hubs.  
While remarkable strides have been made, the problem of providing seamless intuitive guidance within railway stations without the cost of rigid frameworks or complicated structures remains. Many existing system

II. LITERATURE SURVEY

We appear to be keeping pace with the development of machine learning (ML), augmented reality (AR), and 3D indoor map integration; navigation assistance technologies have further improved user-experience within complex environments such as airports and railway stations. Here, I discuss the most important research works toward the development of indoor navigation technologies with particular focus on the integrated technologies with the navigation systems. 
A. 3D Mapping And Pathfinding Algorithms:
In order to achieve accurate indoor navigation, the use of 3D maps is necessary to represent and pathfind in complex indoor spaces. Singh et al. (2021) pointed out the usefulness of Dijkstra’s algorithm in dynamic pathfinding algorithms for stactic environments such as railway stations, malls, or airports where the level of crowds is continuously changing. They also mentioned that these algorithms use environmental data and adaptation algorithms to ensure the user is provided with an optimal route [1].  
Zhang et al. (2018) improved upon this notion by using AR with 3D maps to guide users in closed indoor spaces. Their system not only navigated users through the optimal path, but also informed them in real-time about other facilities like toilets and ticket counters, thus enhancing the navigation experience further [8]. The combination of real-time information and 3D mapping showed in both studies demonstrates the ability of AR technology to enhance navigation accuracy in complex indoor structures.
B. Machine Learning for Indoor Navigation:
Efforts have been made to apply machine learning (ML) techniques for refining the process of pathfinding and user location identification in indoor navigation. Alavi et al. (2018) proposed a deep learning model with convolutional neural networks (CNN) that was able to utilize data from an indoor positioning system (IPS) for better localization of users in GPS denied environments. Their model showed that machine learning was capable of tracking users accurately and improving performance over existing models [3].
Along these lines, Xiong et al. (2019) merged ML with realtime localization data, integrating RNNs to improve pathfinding. Their research proved the ability of deep learning to improve the data vis- IPS for better real-time localization in more dynamic surroundings [6]. These two studies combined demonstrate the impact of deep learning techniques on the effectiveness of GPS-less indoor navigation systems while adapting to the dynamics of real-time environment complexities.
Li et al. (2017) studied the use of machine learning in indoor navigation and pointed out issues with regard the application. They highlighted the complete need for effective algorithms capable of dealing with uncertainty parameters like signal dropouts and endless interference prevalent in indoor space. 
C. Merging Indoor Positioning Systems with Real Time Locating:  
The IPS perform indoor tracking and navigation, and has significant importance when areas such as GPS denied regions are of concern. Kasim et al. (2017) demonstrated that with the use of Wi-Fi and Bluetooth Low Energy (BLE) signals, IPS could indeed achieve high levels of accuracy in large indoor areas such as malls and railway stations [5]. This work came to be the basis for a lot of further activity in areas of actual time navigation systems where traditional aids do not work.  
Furthermore, Li et al. (2020) advanced this work, merging IPS with real time data from sensors to aid in navigation heuristics. Their system consisting of particle filters, sensor information and other data altered the direction of travel based on user patterns and changes in the environment, for example, crowding [9]. The combination of these two approaches clearly shows the potential of real time data in IPS in providing more flexible and responsive systems for navigation.  
D. Augmented Reality in Indoor Navigation:  
AR has emerged as a powerful augmenting technologies for enriching and enabling new user experiences in indoor navigation systems. As an example, Zeinalipour-Yazti et al. (2017) developed an AR-based system that provided visual guidance by placing directional instructions on the user’s device in real-time. This method worked particularly well in places like airports, where visual navigation aids are critical for maneuvering through different areas [7].  
In addition, Zhang et al. (2018) incorporated AR with 3D maps to develop an animated navigation system with the aim of making it more interesting. Their work enabled users to receive detailed instructions and also see facilities along the user’s pathway, including waiting lounges and food courts. Such use of AR improved the navigation experience, but more importantly, it helped users understand their environment in crowded and busy places such as railway stations and malls [8]. These studies, integrating AR and 3D mapping, can help understand how visual guidance improves navigation in high-traffic places.  
E. Challenges and Future Directions:
Even with the rise of new technologies for orientation within buildings, there are still some challenges. One of the main concerns is the high computational burden of the systems which can make it difficult to put into practice on real-time applications. For example, the accuracy of deep learning approaches such as CNNs and RNNs is accompanied by constraints due to their high computational requirements, posing challenges for implementation on low-power hardware devices [4], [9].
Also, systematic inclusivity relevant for people with disabilities leaves a lot to be desired further down the line. Like many other systems, it mainly uses primary GPS functions, thus neglecting specific characteristics of the elderly or handicapped people. As described in the research by Zhang et al. (2018), adding personalized features like voice guidance and tailored mobility constrained routes is still an important gap in modern navigation systems [8].

III. METHODOLOGY

TrackIt is an automated 3D navigation system for indoor places such as railway stations. It provides real-time navigation and location tracking using an interactive 3D map interface while following a sequential process.

A. GPS and IPS Integration

The user’s location can be determined using GPS closer to the outdoors or entryways. Since GPS tends to have challenges operating indoors, TrackIt comes equipped with an Indoor Positioning System (IPS) that uses Wi-Fi, Bluetooth beacons, smartphone sensors like accelerometers, gyroscopes, and magnetometers to provide optimal localization in GPS denied areas [9][10].

B. 3D Environment & map rendering
A station’s 3D model is developed using Blender along with other architecture dependant features such as platforms, counters, elevators, stairs, ramps, physical dividers, and barriers. This model is then rendered in either Unity or WebGL whereby users can interact with it through zooming, rotating, and switching controls.
C. Navigation Graph Construction 
To navigate in 3D space, the walkable areas are converted into a node-edge graph. In this case, nodes indicate locations of interest which include entries, platforms, and lifts while edges are the possible routes available. Each edge is weighted depending on how far it is, how accessible it is, and what kind of obstacles it has.
D. A* Based Shortest Path Calculation
The shortest path to be computed is selected using the A* algorithm. The algorithm computes both movement cost (g-cost) and an estimated cost (h-cost), incorporating both area bypassed and level changes. It can be overridden during user navigation if the user deviates from the path or enters restricted zones [12]. The steps provided are a list of nodes with direction for movement given. 
f(n) = g(n) + h(n)
Where:
●	f(n) = total cost function for node n

●	g(n) = cost from the start node to node n (actual movement cost)

●	h(n) = estimated cost from node n to the goal (heuristic)

E. Integration and System Backend 
TrackIt’s frontend is developed with React allowing users to interact with an intuitive interface showing a 3D map rendered in real time with navigation aids. OTP login route calculations and database requests are processes handled by the backend, written in Node.js and Express Framework. Information like 3D map coordinates, paths, user activity sessions, and user feedback are stored in a PostgreSQL database outfitted with PostGIS spatial extensions.

 
Figure 1. System Architecture Diagram

IV.  IMPLEMENTATION
A. Software Development
TrackIt is deployed as a web application having an end-to-end technology stack of frontend, backend, database, and 3D visualization technologies for smooth indoor wayfinding of railway stations. The frontend is coded in React.js, and the users can select their station, enter their source and destination, and engage with an interactive 3D map. The backend coded in Node.js with the Express framework processes API requests, route calculation processing, OTP login processing, and database processing.
PostGIS-enabled PostgreSQL is used to store route history, 3D points, node-edge graph, and user data. To offer ease of performance and scalability, the system is cloud-optimized with real-time update and efficient data processing, especially where repositioning of route or user location is involved.
B. 3D Mapping and Navigation Logic
TrackIt contains a 3D map that accurately depicts railway station inner structure. The model is created in Blender to include features required like platforms, counters, elevators, stairs, and barriers. The 3D map is hand-sketching on Unity and constructed using WebGL for web integration to facilitate easy zooming, panning, and route visualization.
Pathfinding is accomplished by graphing over-able space as nodes and routes as edges. Edges are weighted based on accessibility, distance, and obstructions. Shortest length path is then calculated by A* algorithm based on cost of travel and heuristic estimate. Multi-level transitions (e.g., stairs, ramps, and elevators) are also supported, in which real-time re-routing can be done if a user is redirected off course.
C. User Interface (UI)
The responsive and interactive UI is built using React.js. Once they successfully log in through OTP verification, they are required to select the station and enter source and destination addresses. They even receive a visual trace of their ongoing movement on the 3D map in real-time.
Instructions such as "Walk left staircase" or "Straight walk 20 meters" appear as step-by-step instructions in the UI to direct the users. The interface folds and warps for desktop, mobile, tablet, and smartphone usage with responsive design and real-time visual feedback.
Similarly, in the process of a navigation session, users receive feedback in terms of a questionnaire to enable them to self-check how well their experience turns out and provide suggestions for improvement. This kind of feedback is stored and utilized in route suggestion and usability improvement of the app.



Figure 2. User I nterface
 
Figure 3. Use Case Diagram


V. RESULTS
Following fig.4. Comparative Time taken by Manual Vs TrackIt Navigation is based on Chaklapati & Yadav's work in Data-driven Analysis and Certainty Modelling for Passengers’ Intuitive Navigation Within the Entrance Lobby of a Railway Station showed timings which comprise the basis for the grouped bar chart. The four navigation steps considered in the grouped bar chart (1) Column → Display Board, (2) Train‑Info Lookup + Sitting, (3) North Entry → Central Area, and (4) Display Board → Ticket Machine are compared under actual survey conditions and with TrackIt 3D map guidance. These segments in the study take around 15 s, 720 s, 14 s, and 14 s, respectively, which is indicative of the stabilisation that occurs due to uncertainty in the wayfinding process and unintentional pauses [14]. The corresponding totals with TrackIt are 7 s, 300 s, 7 s, and 7 s—representing a 50% reduction for short hops and 58% for longer dwell behaviors. The dramatic reductions illustrate the impact that 3D map step-by-step guide prompt decision-making, seat selection and information retrieval, as well as aimless travel within the space were able to achieve..


 
Figure 4. Comparative Time taken by Manual Vs TrackIt Navigation

In the primary Two-Town lobby, where 76 passenger navigation paths were tracked, 46 samples (approx. 61 percent) were taken during peak hours and 30 samples (approx. 39 percent) were taken during non-peak hours. This distribution makes it clear where the greatest operational difficulties, and therefore the greatest risk of delays, with the most crowding  [14].

  
Figure 5. Navigation Sample: Peak Vs Non-Peak
The feedback indicated that navigation times improved by between 50% to 58%, especially for short and long movements. In addition, the percentage of passengers who used the Two-Town lobby dropped from 49% to 35%, which helped reduce congestion. The system was found to be effective in controlling large crowd volumes and optimizing station flow, with 61% of observations taken during peak times
VI. CONCLUSION
TrackIt responds to the increasing demand for effective indoor wayfinding in large and complex railway stations, where conventional wayfinding techniques tend to fail to assist users—particularly first-time visitors, older people, and people with disabilities. The system provides intuitive, real-time navigation through the combination of 3D modeling, A* algorithm-based pathfinding, and low-cost indoor positioning using Wi-Fi, Bluetooth beacons, and mobile sensors. Contrary to systems dependent on costly AR hardware, TrackIt functions well with ordinary smartphones and browsers, increasing accessibility and ease of implementation. Modular structure makes easy adjustments feasible for different station configurations with minimal structural modifications. Testing indicates quicker route detection, greater spatial awareness with 3D visualization, and fewer navigation errors. Feedback from users points to simplicity, responsiveness, and visual clarity as major benefits over conventional systems. TrackIt adequately addresses indoor navigation needs today with scalable, easy-to-use technology designed for today's public transportation environments.

VII. REFERENCES

[1]	Yan, J., Zlatanova, S., & Diakité, A. (2021). A unified 3D space-based navigation model for seamless navigation in indoor and outdoor. International Journal of Digital Earth, 14(8), 985–1003
[2]	Kasim, S. et al. (2017). Indoor Navigation Using A* Algorithm. In: Herawan, T., Ghazali, R., Nawi, N.M., Deris, M.M. (eds) Recent Advances on Soft Computing and Data Mining. SCDM 2016. Advances in Intelligent Systems and Computing, vol 549. Springer, Cham.  
[3]	E. J. Alqahtani, F. H. Alshamrani, H. F. Syed and F. A. Alhaidari, "Survey on Algorithms and Techniques for Indoor Navigation Systems," 2018 21st Saudi Computer Society National Computer Conference (NCC), Riyadh, Saudi Arabia, 2018, pp. 1-9, doi: 10.1109/NCG.2018.8593096.

[4]	Jaiteg Singh 1,*,† , Noopur Tyagi 1, Saravjeet Singh 1, Ahmad Ali         AlZubi 2,*, Firas Ibrahim AlZubi 3 Sukhjit Singh Sehra 4 andFarmanAli5,†
[5]	An indoor navigation model and its network extraction F Mortari, E Clementini, S Zlatanova, L Liu - Applied Geomatics, 2019 - Springer

[6]	Grandi FMorganti APeruzzini MRaffaeli R(2025)Indoor Navigation Systems with Extended Reality: A Comparison of Different ApproachesDesign Tools and Methods in Industrial Engineering IV10.1007/978-3-031-76594-0_30(263-270)Online publication date: 12-Feb-2025
[7]	D. Zeinalipour-Yazti, C. Laoudias, K. Georgiou and G. Chatzimilioudis, "Internet-Based Indoor Navigation Services," in IEEE Internet Computing, vol. 21, no. 4, pp. 54-63, 2017, doi: 10.1109/MIC.2017.2911420.

[8]	Yang, A., Luo, Y., Chen, L., Xu, Y. (2017). Survey of 3D Map in SLAM: Localization and Navigation. In: Fei, M., Ma, S., Li, X., Sun, X., Jia, L., Su, Z. (eds) Advanced Computational Methods in Life System Modeling and Simulation. ICSEE LSMS 2017 2017. Communications in Computer and Information Science, vol 761. Springer, Singapore. https://doi.org/10.1007/978-981-10-6370-1_41

[9]	Liu, H., Darabi, H., Banerjee, P., & Liu, J. (2007). Survey of Wireless Indoor Positioning Techniques and Systems. IEEE Transactions on Systems, Man, and Cybernetics, Part C (Applications and Reviews), 37(6), 1067–1080. https://doi.org/10.1109/TSMCC.2007.905750

[10]	Zafari, F., Gkelias, A., & Leung, K. K. (2019). A Survey of Indoor Localization Systems and Technologies. IEEE Communications Surveys & Tutorials, 21(3), 2568–2599. https://doi.org/10.1109/COMST.2019.2911558

[11]	Chen, Z., Li, M., & Jiang, C. (2014). Indoor Localization Using Smartphone Sensors and 3D Indoor Map. In Proceedings of the ACM International Conference on Ubiquitous Computing (UbiComp), 2014, 755–766. https://doi.org/10.1145/2632048.2632098

[12]	Hart, P. E., Nilsson, N. J., & Raphael, B. (1968). A Formal Basis for the Heuristic Determination of Minimum Cost Paths. IEEE Transactions on Systems Science and Cybernetics, 4(2), 100–107. https://doi.org/10.1109/TSSC.1968.300136

[13]	Park, J., & Kim, S. (2021). A Real-Time Indoor Navigation System Using IPS and Map Matching in Large Complex Facilities. Sensors, 21(9), 3143. https://doi.org/10.3390/s21093143

[14]	Chilakapati, Dr. Anil Kumar and Yadav, Tarachand, Data-Driven Analysis and Certainty Modelling for Passengers’ Intuitive Navigation within the Entrance Lobby of a Railway Station. Available at SSRN: https://ssrn.com/abstract=4910149






